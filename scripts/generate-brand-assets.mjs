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

const source =
  process.argv[2] ??
  "/home/javi/.cursor/projects/var-www-sabhoy-es/assets/logo-09c9be39-8edd-41ab-b178-eb6852a79c32.png";

const brandingDir = path.join(root, "public", "branding");
const iconsDir = path.join(root, "public", "icons");

/** Rosetón simplificado del logo (escala bien a 16–32 px). */
const FAVICON_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="sabhoy">
  <rect width="32" height="32" rx="7" fill="#0b4f84"/>
  <circle cx="16" cy="16" r="11.5" fill="#d1e3f3"/>
  <circle cx="16" cy="16" r="9.5" fill="none" stroke="#4a86c5" stroke-width="1.2"/>
  <g fill="#0b4f84" stroke="#0b4f84" stroke-width="0.4">
    <ellipse cx="16" cy="16" rx="3.2" ry="8.5"/>
    <ellipse cx="16" cy="16" rx="8.5" ry="3.2"/>
    <ellipse cx="16" cy="16" rx="6.2" ry="6.2" transform="rotate(45 16 16)"/>
    <circle cx="16" cy="16" r="2.1" fill="#4a86c5" stroke="none"/>
  </g>
</svg>`;

const FAVICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];

async function writeLogo() {
  const trimmed = await sharp(source).trim({ threshold: 12 }).png({ compressionLevel: 9 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const logoHeight = 100;
  const logoWidth = Math.round((meta.width / meta.height) * logoHeight);

  await sharp(trimmed)
    .resize(logoWidth, logoHeight, { fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(brandingDir, "logo-sabhoy.png"));

  return { logoWidth, logoHeight };
}

async function writeFavicons() {
  const svgBuffer = Buffer.from(FAVICON_SVG);

  await writeFile(path.join(brandingDir, "favicon.svg"), FAVICON_SVG);

  const pngBySize = {};
  for (const size of FAVICON_SIZES) {
    const out = path.join(iconsDir, `favicon-${size}x${size}.png`);
    await sharp(svgBuffer, { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    pngBySize[size] = out;
  }

  // Next.js metadata (app/)
  await sharp(svgBuffer, { density: 384 }).resize(512, 512).png().toFile(path.join(root, "app", "icon.png"));
  await sharp(svgBuffer, { density: 384 }).resize(180, 180).png().toFile(path.join(root, "app", "apple-icon.png"));

  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      buffer: await sharp(svgBuffer).resize(size, size).png().toBuffer(),
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

  const { logoWidth, logoHeight } = await writeLogo();
  await writeFavicons();

  console.log(JSON.stringify({ ok: true, logoWidth, logoHeight, source }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
