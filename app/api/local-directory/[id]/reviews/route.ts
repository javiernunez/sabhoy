import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshDirectoryEntryRating } from "@/lib/local-directory-ratings";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  const entryId = Number(params.id);
  if (Number.isNaN(entryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const reviews = await prisma.localDirectoryReview.findMany({
    where: { entryId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request, { params }: Params) {
  const entryId = Number(params.id);
  if (Number.isNaN(entryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const score = Number(body.score);
  const author = body.author ? String(body.author).trim().slice(0, 80) : null;
  const comment = body.comment ? String(body.comment).trim().slice(0, 500) : null;

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const exists = await prisma.localDirectoryEntry.findUnique({
    where: { id: entryId },
    select: { id: true, isActive: true },
  });
  if (!exists || !exists.isActive) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const review = await prisma.localDirectoryReview.create({
    data: {
      entryId,
      score,
      author,
      comment,
    },
  });

  await refreshDirectoryEntryRating(entryId);

  return NextResponse.json(review, { status: 201 });
}
