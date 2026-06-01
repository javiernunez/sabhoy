import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

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
  const title = String(body.title || "").trim();
  const titleVal = body.titleVal != null ? String(body.titleVal).trim() || null : null;
  const content = String(body.content || "").trim();
  const contentVal = body.contentVal != null ? String(body.contentVal).trim() || null : null;
  const slug = slugify(String(body.slug || title));
  const isHighlighted = Boolean(body.isHighlighted);

  if (!title || !content || !slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const page = await prisma.evergreenPage.update({
    where: { id },
    data: { title, titleVal, slug, content, contentVal, isHighlighted },
  });

  return NextResponse.json(page);
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.evergreenPage.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
