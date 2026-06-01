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

  const body = (await request.json().catch(() => null)) as { imageUrl?: string } | null;
  const imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : null;

  const updated = await prisma.localDirectoryEntry.update({
    where: { id },
    data: { imageUrl },
    select: { id: true, imageUrl: true },
  });

  return NextResponse.json(updated);
}
