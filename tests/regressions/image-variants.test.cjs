"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

/** Lógica espejo de lib/image-variants.ts para tests sin transpilar TS. */
function mediaUrlForVariant(url, variantWidth) {
  if (variantWidth === 1920) return url;
  const suffix = `-w${variantWidth}.webp`;
  if (url.startsWith("/")) return url.replace(/\.webp$/i, suffix);
  return url;
}

function masterPathFromVariantPath(pathParts) {
  const last = pathParts[pathParts.length - 1];
  const m = /^(.+)-w\d+\.webp$/i.exec(last);
  if (!m) return null;
  return [...pathParts.slice(0, -1), `${m[1]}.webp`];
}

function pickVariantForDisplay(cssWidth) {
  const target = Math.ceil(cssWidth * 2);
  if (target <= 360) return 320;
  if (target <= 720) return 640;
  if (target <= 1400) return 1200;
  return 1920;
}

test("mediaUrlForVariant añade sufijo de ancho", () => {
  assert.equal(mediaUrlForVariant("/media/2025/05/foo.webp", 320), "/media/2025/05/foo-w320.webp");
});

test("masterPathFromVariantPath revierte variante", () => {
  assert.deepEqual(masterPathFromVariantPath(["2025", "05", "foo-w320.webp"]), ["2025", "05", "foo.webp"]);
});

test("pickVariantForDisplay elige thumb para listados", () => {
  assert.equal(pickVariantForDisplay(160), 320);
  assert.equal(pickVariantForDisplay(280), 640);
});
