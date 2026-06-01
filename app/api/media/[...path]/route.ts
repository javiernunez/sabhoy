import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { masterPathFromVariantPath } from "@/lib/image-variants";

export const runtime = "nodejs";

function contentTypeFor(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function isSafeSegment(segment: string): boolean {
  return segment.length > 0 && !segment.includes("..") && !segment.includes("/") && !segment.includes("\\");
}

async function findExistingPath(parts: string[]): Promise<string | null> {
  const roots = [
    join(process.cwd(), "public", "media"),
    "/opt/sabhoy.es/public/media",
  ];

  for (const root of roots) {
    const filePath = join(root, ...parts);
    try {
      await access(filePath, fsConstants.R_OK);
      return filePath;
    } catch {
      // try next root
    }
  }
  return null;
}

export async function GET(_: Request, { params }: { params: { path: string[] } }) {
  const parts = params.path ?? [];
  if (parts.length === 0 || !parts.every(isSafeSegment)) {
    return NextResponse.json({ error: "Ruta invalida" }, { status: 400 });
  }

  let filePath = await findExistingPath(parts);
  if (!filePath) {
    const masterParts = masterPathFromVariantPath(parts);
    if (masterParts) {
      filePath = await findExistingPath(masterParts);
    }
  }
  if (!filePath) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await readFile(filePath);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
