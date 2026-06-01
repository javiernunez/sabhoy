import { VideoCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";

type Params = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const url = String(body.url || "").trim();
  const description = String(body.description || "").trim();
  const descriptionVal = body.descriptionVal != null ? String(body.descriptionVal).trim() || null : null;
  const categoryRaw = body.category != null ? String(body.category).trim() : undefined;
  const category =
    categoryRaw && Object.values(VideoCategory).includes(categoryRaw as VideoCategory)
      ? (categoryRaw as VideoCategory)
      : undefined;

  if (!url || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await prisma.video.update({
    where: { id },
    data: { url, description, descriptionVal, ...(category != null ? { category } : {}) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
