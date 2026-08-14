import { describe, expect, it } from "vitest";
import { articleEntries } from "./ArticleDetail";

describe("مكتبة المقالات وSEO", () => {
  it("تحتوي 62 مقالة قابلة للفهرسة مع كلمات وصفية وروابط فريدة", () => {
    expect(articleEntries).toHaveLength(62);
    expect(new Set(articleEntries.map((article) => article.slug)).size).toBe(62);
    articleEntries.forEach((article) => {
      expect(article.title.trim()).not.toBe("");
      expect(article.intro.trim()).not.toBe("");
      expect(article.keywords.length).toBeGreaterThanOrEqual(3);
      expect(article.sections.length).toBeGreaterThanOrEqual(21);
      const wordCount = [article.title, article.intro, ...article.sections.flatMap(([heading, body]) => [heading, body])].join(" ").trim().split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeGreaterThanOrEqual(1500);
    });
  });
});
