import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";

export async function POST(request: Request) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = (body as { ids?: unknown })?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }
  if (!ids.every((x): x is number => typeof x === "number" && Number.isInteger(x))) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const unique = [...new Set(ids)];
  const found = await prisma.article.findMany({
    where: { id: { in: unique }, status: "published" },
    select: { id: true },
  });
  if (found.length !== unique.length) {
    return NextResponse.json({ error: "Solo se pueden ordenar noticias publicadas." }, { status: 400 });
  }

  const n = unique.length;
  await prisma.$transaction(
    unique.map((articleId, index) =>
      prisma.article.update({
        where: { id: articleId },
        data: { portadaRank: n - index },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
