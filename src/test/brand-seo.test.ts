import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Guardrail: SEO meta tags (title, description, canonical, og:*, twitter:*)
 * and JSON-LD must only ever reference the "Serverus" brand.
 *
 * Any occurrence of "webweaver" (case-insensitive) anywhere in the shipped
 * source — index.html, src/**, supabase/functions/** — fails the build.
 */

const FORBIDDEN = /webweaver/i;
const ROOTS = ["index.html", "src", "supabase/functions", "public"];
const IGNORED_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg", ".woff", ".woff2", ".ttf"]);

function walk(path: string, out: string[] = []): string[] {
  const s = statSync(path);
  if (s.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(join(path, entry), out);
    }
  } else {
    const dot = path.lastIndexOf(".");
    const ext = dot >= 0 ? path.slice(dot).toLowerCase() : "";
    if (!IGNORED_EXT.has(ext)) out.push(path);
  }
  return out;
}

describe("brand SEO guardrail", () => {
  it("has no 'WebWeaver' references anywhere in shipped source", () => {
    const offenders: string[] = [];
    for (const root of ROOTS) {
      let files: string[] = [];
      try { files = walk(root); } catch { continue; }
      for (const file of files) {
        const content = readFileSync(file, "utf8");
        if (FORBIDDEN.test(content)) {
          const line = content.split("\n").findIndex(l => FORBIDDEN.test(l)) + 1;
          offenders.push(`${file}:${line}`);
        }
      }
    }
    expect(offenders, `Forbidden brand reference found:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("index.html title and description reference Serverus", () => {
    const html = readFileSync("index.html", "utf8");
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? "";
    expect(title).toMatch(/Serverus/);
    expect(title).not.toMatch(/Lovable/i);
    expect(desc.length).toBeGreaterThan(0);
    expect(desc).not.toMatch(/Lovable Generated Project/i);
  });

  it("SEOHead component uses Serverus site name and non-webweaver base URL", () => {
    const src = readFileSync("src/components/SEOHead.tsx", "utf8");
    expect(src).toMatch(/og:site_name.*Serverus/);
    expect(src).not.toMatch(FORBIDDEN);
  });
});
