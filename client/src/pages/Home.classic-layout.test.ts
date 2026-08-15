import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "../../..");
const read = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("التصميم العام المستعاد", () => {
  it("يعرض الصفحة الرئيسية الكلاسيكية بإدخال حر فقط", () => {
    const home = read("client/src/pages/Home.tsx");
    expect(home).toContain('className="classic-home"');
    expect(home).toContain("classic-request-form");
    expect(home).not.toContain("<select");
  });

  it("يزيل زري الحجز والتواصل من الترويسة من دون تغيير قارئ المقالات", () => {
    const shell = read("client/src/components/SiteShell.tsx");
    const article = read("client/src/pages/ArticlePages.tsx");
    expect(shell).not.toContain('className="outline-action"');
    expect(shell).not.toContain('className="phone-action"');
    expect(article).toContain("article-actions");
    expect(article).toContain("مشاركة المقال");
  });
});
