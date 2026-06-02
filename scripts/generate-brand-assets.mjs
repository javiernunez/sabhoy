/**
 * Genera logo optimizado y favicons a partir del logo sabhoy.
 * Uso: node scripts/generate-brand-assets.mjs [ruta-logo-origen]
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const defaultSource = path.join(root, "assets", "logo-source.png");
const fallbackSource = path.join(root, "public", "branding", "logo-sabhoy.png");
const source = process.argv[2] ?? defaultSource;

const brandingDir = path.join(root, "public", "branding");
const iconsDir = path.join(root, "public", "icons");

/**
 * Recorte de la torre (parte alta, perfil) — similar en espíritu al favicon de lelianahoy:
 * icono pequeño, fondo transparente, detalle legible a 16–32 px.
 */
const TOWER_CROP = {
  leftRatio: 0.07,
  widthRatio: 0.16,
  heightRatio: 0.42,
};

const WHITE_ALPHA_THRESHOLD = 248;
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

const FAVICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];

async function resolveSourcePath() {
  const { access } = await import("node:fs/promises");
  try {
    await access(source);
    return source;
  } catch {
    await access(fallbackSource);
    return fallbackSource;
  }
}

/** Convierte blancos del logo en transparencia (fondo del PNG de origen). */
async function removeNearWhite(inputBuffer, threshold = WHITE_ALPHA_THRESHOLD) {
  const { data, info } = await sharp(inputBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      pixels[i + 3] = 0;
    }
  }
  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Torre superior del logo, fondo transparente, ampliada para favicon. */
async function buildTowerFaviconMaster(logoPath) {
  const trimmed = await sharp(logoPath).trim({ threshold: 12 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const left = Math.round(meta.width * TOWER_CROP.leftRatio);
  const cropW = Math.min(meta.width - left, Math.round(meta.width * TOWER_CROP.widthRatio));
  const cropH = Math.round(meta.height * TOWER_CROP.heightRatio);

  let tower = await sharp(trimmed)
    .extract({ left, top: 0, width: cropW, height: cropH })
    .png()
    .toBuffer();

  tower = await removeNearWhite(tower);

  return sharp(tower)
    .sharpen({ sigma: 1, m1: 0.5, m2: 0.35 })
    .resize(500, 500, { fit: "inside", background: TRANSPARENT, kernel: sharp.kernel.lanczos3 })
    .extend({
      top: 6,
      bottom: 6,
      left: 6,
      right: 6,
      background: TRANSPARENT,
    })
    .png()
    .toBuffer();
}

function resizeFavicon(master, size) {
  const pipeline = sharp(master).resize(size, size, {
    fit: size <= 48 ? "cover" : "inside",
    position: "centre",
    background: TRANSPARENT,
    kernel: sharp.kernel.lanczos3,
  });
  return pipeline.png({ compressionLevel: 9 });
}

async function writeLogo(logoPath) {
  const trimmed = await sharp(logoPath).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const logoHeight = 120;
  const logoWidth = Math.round((meta.width / meta.height) * logoHeight);

  await sharp(trimmed)
    .resize(logoWidth, logoHeight, { fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(brandingDir, "logo-sabhoy.png"));

  return { logoWidth, logoHeight };
}

async function writeFavicons(logoPath) {
  const master = await buildTowerFaviconMaster(logoPath);

  const pngBySize = {};
  for (const size of FAVICON_SIZES) {
    const out = path.join(iconsDir, `favicon-${size}x${size}.png`);
    await resizeFavicon(master, size).toFile(out);
    pngBySize[size] = out;
  }

  await sharp(master).toFile(path.join(brandingDir, "favicon-tower-512.png"));

  await sharp(master).toFile(path.join(root, "app", "icon.png"));
  await sharp(master).resize(180, 180).png().toFile(path.join(root, "app", "apple-icon.png"));

  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      buffer: await resizeFavicon(master, size).toBuffer(),
    })),
  );

  for (const target of [path.join(root, "public", "favicon.ico"), path.join(root, "app", "favicon.ico")]) {
    await writeIco(target, icoImages);
  }

  return pngBySize;
}

/** ICO con varias resoluciones (formato Windows estándar). */
async function writeIco(filePath, images) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];

  for (const { size, buffer } of images) {
    entries.push({ size, buffer, offset });
    offset += buffer.length;
  }

  const totalSize = offset;
  const out = Buffer.alloc(totalSize);
  let pos = 0;

  out.writeUInt16LE(0, pos);
  pos += 2;
  out.writeUInt16LE(1, pos);
  pos += 2;
  out.writeUInt16LE(count, pos);
  pos += 2;

  for (const { size, buffer, offset: entryOffset } of entries) {
    const dim = size >= 256 ? 0 : size;
    out.writeUInt8(dim, pos);
    pos += 1;
    out.writeUInt8(dim, pos);
    pos += 1;
    out.writeUInt8(0, pos);
    pos += 1;
    out.writeUInt8(0, pos);
    pos += 1;
    out.writeUInt16LE(1, pos);
    pos += 2;
    out.writeUInt16LE(32, pos);
    pos += 2;
    out.writeUInt32LE(buffer.length, pos);
    pos += 4;
    out.writeUInt32LE(entryOffset, pos);
    pos += 4;
  }

  for (const { buffer } of entries) {
    buffer.copy(out, pos);
    pos += buffer.length;
  }

  await writeFile(filePath, out);
}

async function main() {
  await mkdir(brandingDir, { recursive: true });
  await mkdir(iconsDir, { recursive: true });

  const resolvedSource = await resolveSourcePath();
  const { logoWidth, logoHeight } = await writeLogo(resolvedSource);
  await writeFavicons(resolvedSource);

  console.log(JSON.stringify({ ok: true, logoWidth, logoHeight, source: resolvedSource }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
