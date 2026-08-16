import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./index.css", import.meta.url), "utf8");

describe("الحركة المخففة", () => {
  it("يعطّل الحركة غير الأساسية عندما يفضّل الزائر تقليل الحركة", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/animation:\s*none\s*!important/);
    expect(css).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });

  it("يثبت لون زر المزيد ويضيف حركة تحويم للصور الرئيسية", () => {
    expect(css).toMatch(/\.nav-more-trigger[^}]*color:\s*var\(--teal-dark\)\s*!important/);
    expect(css).toContain(".service-card:focus-within .service-art");
    expect(css).toContain(".hero-caddy-art:hover img");
  });
});
