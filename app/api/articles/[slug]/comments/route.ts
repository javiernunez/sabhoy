import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { slug: string };
};

export async function GET(_: Request, { params }: Params) {
  const slug = String(params.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (article?.status !== "published") {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const comments = await prisma.articleComment.findMany({
    where: { articleId: article.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const slug = String(params.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (article?.status !== "published") {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = String(body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const fallbackName = session.user.email ? session.user.email.split("@")[0] : "Usuario";
  const author = (session.user.name || fallbackName).trim().slice(0, 80);

  const comment = await prisma.articleComment.create({
    data: {
      articleId: article.id,
      userId: session.user.id,
      author: author || null,
      content,
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
