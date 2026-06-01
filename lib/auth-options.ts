import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/roles";
import { getNextAuthSecret } from "@/lib/env-auth";

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/cuenta/iniciar-sesion" },
  providers: [
    Credentials({
      name: "email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) {
          return null;
        }

        const row = await prisma.user.findUnique({ where: { email } });
        if (!row) {
          return null;
        }

        const ok = await bcrypt.compare(password, row.passwordHash);
        if (!ok) {
          return null;
        }

        let role: UserRole = row.role;
        if (isAdminEmail(email) && row.role === "USER") {
          const updated = await prisma.user.update({
            where: { id: row.id },
            data: { role: "ADMIN" },
          });
          role = updated.role;
        } else if (isAdminEmail(email)) {
          role = "ADMIN";
        }

        return {
          id: row.id,
          email: row.email,
          name: row.name,
          image: row.image,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const u = user as { id: string; role: UserRole; email: string; name: string | null; image: string | null };
        token.id = u.id;
        token.role = u.role;
        token.sub = u.id;
        token.name = u.name;
        token.email = u.email;
        token.picture = u.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};
