const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(relPath) {
  const abs = path.join(process.cwd(), relPath);
  return fs.readFileSync(abs, "utf8");
}

test("evergreen dynamic route stays force-dynamic", () => {
  const src = read("app/[slug]/page.tsx");
  assert.match(
    src,
    /export const dynamic = ["']force-dynamic["'];/,
    "app/[slug]/page.tsx must export dynamic='force-dynamic' to prevent DYNAMIC_SERVER_USAGE"
  );
});

test("sitemap has DB-unavailable fallback guard", () => {
  const src = read("app/sitemap.ts");
  assert.match(
    src,
    /function isDbUnavailable\(/,
    "app/sitemap.ts should include DB unavailable detector"
  );
  assert.match(
    src,
    /safeFindMany\(/,
    "app/sitemap.ts should use safeFindMany fallback to avoid CI/build failures without DB"
  );
});

test("sitemap lists canonical colegios URLs, not school evergreen slugs", () => {
  const src = read("app/sitemap.ts");
  assert.match(src, /isSchoolEvergreenSlug/, "sitemap should exclude school evergreen slugs from /{slug}");
  assert.match(src, /\/colegios\/\$\{school\.slug\}/, "sitemap should include /colegios/{slug} routes");
  assert.match(src, /informacion-util\/\$\{cat\.slug\}/, "sitemap should include info category routes");
});
