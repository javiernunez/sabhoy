import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEventsWriteAuthorized } from "@/lib/api-auth";
import { slugify } from "@/lib/slug";
import { coerceEventCategory, normalizeDetailsPayload } from "@/lib/event-category";

function toDate(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function asOptionalString(raw: unknown) {
  if (raw == null) return null;
  const value = String(raw).trim();
  return value || null;
}

async function upsertOne(raw: any) {
  const externalId = String(raw?.externalId ?? "").trim();
  const title = String(raw?.title ?? "").trim();
  const titleVal = asOptionalString(raw?.titleVal);
  const description = String(raw?.description ?? "").trim();
  const descriptionVal = asOptionalString(raw?.descriptionVal);
  const eventDate = toDate(raw?.eventDate);
  const imageUrl = asOptionalString(raw?.imageUrl);
  const linkUrl = asOptionalString(raw?.linkUrl);
  const source = asOptionalString(raw?.source) ?? "sanantoniodebenageber.es";
  const sourceUrl = asOptionalString(raw?.sourceUrl);
  const status = asOptionalString(raw?.status) ?? "active";
  const category = coerceEventCategory(raw?.category);

  if (!externalId || !title || !description || !eventDate) {
    return { ok: false as const, error: "Missing fields", externalId: externalId || null };
  }

  const detailsPayload = normalizeDetailsPayload(category, eventDate, raw?.details ?? raw?.extra ?? null);
  if (!detailsPayload.ok) {
    return { ok: false as const, error: detailsPayload.error, externalId: externalId || null };
  }

  const slugBase = slugify(title) || `evento-${eventDate.getTime()}`;
  const db: any = prisma;
  const existingByExternal = await db.event.findUnique({ where: { externalId } });
  const existingBySlug = await db.event.findUnique({ where: { slug: slugBase } });
  const slug =
    existingByExternal?.slug ??
    (existingBySlug && existingBySlug.externalId !== externalId ? `${slugBase}-${Date.now()}` : slugBase);

  const saved = await db.event.upsert({
    where: { externalId },
    update: {
      category,
      details: detailsPayload.value === null ? Prisma.DbNull : detailsPayload.value,
      title,
      titleVal,
      description,
      descriptionVal,
      eventDate,
      imageUrl,
      linkUrl,
      source,
      sourceUrl,
      status,
      slug,
      lastSeenAt: new Date(),
    },
    create: {
      category,
      details: detailsPayload.value === null ? Prisma.DbNull : detailsPayload.value,
      externalId,
      title,
      titleVal,
      description,
      descriptionVal,
      eventDate,
      imageUrl,
      linkUrl,
      source,
      sourceUrl,
      status,
      slug,
      lastSeenAt: new Date(),
    },
  });

  return { ok: true as const, event: saved };
}

function extractBatch(body: unknown): any[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const payload = body as Record<string, unknown>;
    if (Array.isArray(payload.events)) return payload.events as any[];
    if (Array.isArray(payload.items)) return payload.items as any[];
    if (Array.isArray(payload.data)) return payload.data as any[];
  }
  return [body];
}

export async function POST(request: Request) {
  if (!isEventsWriteAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const entries = extractBatch(body);

  if (entries.length === 0) {
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  const results = [];
  for (const entry of entries) {
    try {
      results.push(await upsertOne(entry));
    } catch (error) {
      results.push({
        ok: false as const,
        error: error instanceof Error ? error.message : "Unexpected error",
        externalId: String(entry?.externalId ?? "").trim() || null,
      });
    }
  }

  if (entries.length === 1) {
    const single = results[0];
    if (!single.ok) {
      return NextResponse.json({ error: single.error, externalId: single.externalId }, { status: 400 });
    }
    return NextResponse.json(single.event, { status: 200 });
  }

  const ok = results.filter((item) => item.ok).length;
  const failed = results.length - ok;
  const statusCode = failed > 0 ? 207 : 200;

  return NextResponse.json(
    {
      total: results.length,
      ok,
      failed,
      results,
    },
    { status: statusCode }
  );
}
