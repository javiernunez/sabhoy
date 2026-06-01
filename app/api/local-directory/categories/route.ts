import { DirectoryKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

function isDirectoryKind(value: string): value is DirectoryKind {
  return Object.values(DirectoryKind).includes(value as DirectoryKind);
}

export async function GET() {
  const categories = await prisma.localDirectoryCategory.findMany({
    include: { parent: true },
    orderBy: [{ kind: "asc" }, { parentId: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const kindRaw = String(body.kind || "");
  const kind = isDirectoryKind(kindRaw) ? kindRaw : null;
  const name = String(body.name || "").trim();
  const nameVal = body.nameVal != null ? String(body.nameVal).trim() || null : null;
  const parentId = body.parentId != null ? Number(body.parentId) : null;

  if (!kind || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (parentId != null && !Number.isInteger(parentId)) {
    return NextResponse.json({ error: "Invalid parentId" }, { status: 400 });
  }

  if (parentId != null) {
    const parent = await prisma.localDirectoryCategory.findUnique({ where: { id: parentId } });
    if (!parent || parent.kind !== kind) {
      return NextResponse.json({ error: "Parent category not found for selected kind" }, { status: 400 });
    }
  }

  const base = parentId ? `${parentId}-${name}` : name;
  const slug = slugify(base);
  const category = await prisma.localDirectoryCategory.create({
    data: { kind, name, nameVal, parentId, slug },
    include: { parent: true },
  });
  return NextResponse.json(category, { status: 201 });
}
