import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { id: string };
};

function parseReportId(rawId: string) {
  const id = Number(rawId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(_: Request, { params }: Params) {
  const reportId = parseReportId(params.id);
  if (!reportId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, status: true },
  });
  if (report?.status !== "published") {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const comments = await prisma.reportComment.findMany({
    where: { reportId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const reportId = parseReportId(params.id);
  if (!reportId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, status: true },
  });
  if (report?.status !== "published") {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = String(body.content || "").trim();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const fallbackName = session.user.email ? session.user.email.split("@")[0] : "Usuario";
  const author = (session.user.name || fallbackName).trim().slice(0, 80);

  const comment = await prisma.reportComment.create({
    data: {
      reportId,
      userId: session.user.id,
      author: author || null,
      content,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
