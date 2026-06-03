import { VideoCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isVideoCategory } from "@/lib/video-categories";
import { resolveUniqueVideoSlug, videoSlugBaseFromDescription } from "@/lib/video-slug";

function categoryFromRequest(searchParams: URLSearchParams) {
  const raw = searchParams.get("categoria");
  return isVideoCategory(raw) ? raw : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = categoryFromRequest(searchParams);
  const videos = await prisma.video.findMany({
    where: category ? { category } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const url = String(body.url || "").trim();
  const description = String(body.description || "").trim();
  const descriptionVal = body.descriptionVal != null ? String(body.descriptionVal).trim() || null : null;
  const categoryRaw = body.category != null ? String(body.category).trim() : "";
  const category = Object.values(VideoCategory).includes(categoryRaw as VideoCategory)
    ? (categoryRaw as VideoCategory)
    : "GENERAL";

  if (!url || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const slug = await resolveUniqueVideoSlug(videoSlugBaseFromDescription(description));
  const created = await prisma.video.create({
    data: { url, description, descriptionVal, category, slug },
  });

  return NextResponse.json(created, { status: 201 });
}
