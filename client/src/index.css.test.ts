import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("./index.css", import.meta.url), "utf8");

describe("استجابة بطاقات المقالات", () => {
  it("يعرض الأدلة المحلية في عمود واحد على الهاتف لتفادي ضغط النص والبطاقات الطويلة", () => {
    expect(stylesheet).toContain("@media (max-width: 720px) { .secondary-article-grid { grid-template-columns: 1fr; gap: .85rem; } }");
    expect(stylesheet).not.toMatch(/\.secondary-article-grid[^}]*content-visibility:\s*auto/);
  });
});
