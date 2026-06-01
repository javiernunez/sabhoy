import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string };
};

export async function POST(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (report?.status !== "published") {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  try {
    await prisma.reportLike.create({
      data: {
        reportId: id,
        userId: session.user.id,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const current = await prisma.report.findUnique({
        where: { id },
        select: { likeCount: true },
      });
      return NextResponse.json({ error: "ALREADY_LIKED", likeCount: current?.likeCount ?? 0 }, { status: 409 });
    }
    throw error;
  }

  const updated = await prisma.report.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
    select: { likeCount: true },
  });

  return NextResponse.json(updated, { status: 200 });
}
