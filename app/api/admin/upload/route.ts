import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import { generateUploadVariants, isAllowedImageMime, MAX_UPLOAD_BYTES } from "@/lib/image-optimize";
import { storeUploadVariantSet } from "@/lib/media-storage";

export const runtime = "nodejs";

function originFromRequest(request: Request) {
  const h = new Headers(request.headers);
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const rawProto = h.get("x-forwarded-proto");
  const proto = rawProto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Fichero demasiado grande (máx. 12 MB)" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File) || !file.size) {
    return NextResponse.json({ error: "Falta el fichero" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Fichero demasiado grande (máx. 12 MB)" }, { status: 400 });
  }

  const mime = file.type;
  if (!isAllowedImageMime(mime)) {
    return NextResponse.json(
      { error: "Tipo no permitido. Usa JPEG, PNG, WebP, GIF o TIFF." },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());

  let generated;
  try {
    generated = await generateUploadVariants(buf, mime);
  } catch (e) {
    console.error("generateUploadVariants", e);
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }

  const totalBytes = generated.reduce((n, v) => n + v.bytes, 0);
  if (totalBytes > MAX_UPLOAD_BYTES * 2) {
    return NextResponse.json({ error: "Tras optimizar supera el tamaño máximo" }, { status: 400 });
  }

  let stored: Awaited<ReturnType<typeof storeUploadVariantSet>>;
  try {
    stored = await storeUploadVariantSet(generated, file.name || "imagen");
  } catch (e) {
    console.error("storeUploadVariantSet", e);
    return NextResponse.json({ error: "Error al guardar (revisa S3 o permisos de public/) " }, { status: 500 });
  }

  const master = stored.variants.find((v) => v.url === stored.url) ?? stored.variants[0]!;
  const o = originFromRequest(request);
  const publicAbsolute = stored.url.startsWith("http") ? stored.url : new URL(stored.url, o).toString();

  return NextResponse.json({
    url: stored.url,
    publicUrl: publicAbsolute,
    width: master.width,
    height: master.height,
    bytes: master.bytes,
    format: "webp",
    storage: stored.url.startsWith("http") ? "s3" : "local",
    variants: stored.variants.map((v) => ({
      width: v.width,
      url: v.url,
      bytes: v.bytes,
      height: v.height,
    })),
  });
}
