import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";
import { notifyNewsletterSubscription } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const raw = String(body.email || "").trim();
  if (!raw || !raw.includes("@")) {
    return NextResponse.json({ error: "Email no valido" }, { status: 400 });
  }
  const email = raw.toLowerCase();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const byEmail = await prisma.newsletterSubscription.findUnique({ where: { email } });
  if (byEmail) {
    if (userId && !byEmail.userId) {
      try {
        await prisma.newsletterSubscription.update({
          where: { id: byEmail.id },
          data: { userId },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          // userId ya usado; se deja el registro por email
        } else {
          throw e;
        }
      }
    }
    return NextResponse.json({ ok: true, message: "Ya estabas inscrito" });
  }

  if (userId) {
    const byUser = await prisma.newsletterSubscription.findUnique({ where: { userId } });
    if (byUser) {
      await prisma.newsletterSubscription.update({
        where: { userId },
        data: { email },
      });
      return NextResponse.json({ ok: true, message: "Preferencias actualizadas" });
    }
  }

  try {
    await prisma.newsletterSubscription.create({
      data: {
        email,
        userId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ ok: true, message: "Ya estabas inscrito" });
    }
    throw e;
  }

  notifyNewsletterSubscription(email, Boolean(userId));

  return NextResponse.json({ ok: true, message: "Inscripcion recibida" });
}
