import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { initialRoleForEmail } from "@/lib/roles";

const MIN_PASSWORD = 8;

export async function POST(request: Request) {
  if (process.env.DISABLE_USER_REGISTRATION === "true") {
    return NextResponse.json({ error: "Registro cerrado" }, { status: 403 });
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const name = body.name ? String(body.name).trim() : null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email no valido" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Contrasena: minimo ${MIN_PASSWORD} caracteres` },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Ese email ya esta registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = initialRoleForEmail(email);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
