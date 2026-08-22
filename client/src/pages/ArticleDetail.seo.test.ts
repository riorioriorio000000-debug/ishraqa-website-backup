import { describe, expect, it } from "vitest";
import { articleEntries } from "./ArticleDetail";

describe("مكتبة المقالات وSEO", () => {
  it("تحتوي 70 مقالة قابلة للفهرسة مع كلمات وصفية وروابط فريدة", () => {
    expect(articleEntries).toHaveLength(70);
    expect(new Set(articleEntries.map((article) => article.slug)).size).toBe(70);
    articleEntries.forEach((article) => {
      expect(article.title.trim()).not.toBe("");
      expect(article.intro.trim()).not.toBe("");
      expect(article.keywords.length).toBeGreaterThanOrEqual(3);
      expect(article.shareImage).toMatch(/^https:\/\/al-eshraqa\.co\/manus-storage\/.+\.(?:png|jpe?g|webp)$/);
      expect(article.sections.length).toBeGreaterThanOrEqual(21);
      const wordCount = [article.title, article.intro, ...article.sections.flatMap(([heading, body]) => [heading, body])].join(" ").trim().split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeGreaterThanOrEqual(1500);
    });
    expect(articleEntries.filter((article) => article.category === "دليل رئيسي").every((article) => article.image && article.imageAlt)).toBe(true);
  });

  it("يربط كل دليل محلي بصورته التحريرية الخاصة بدل رسم تجهيزات الخدمة المتكرر", () => {
    const localArticles = articleEntries.filter((article) => article.category === "دليل محلي");

    expect(localArticles.every((article) => article.image === article.shareImage)).toBe(true);
    expect(new Set(localArticles.map((article) => article.image)).size).toBe(localArticles.length);
    localArticles.forEach((article) => {
      expect(article.image).toMatch(/^https:\/\/al-eshraqa\.co\/manus-storage\/.+\.png$/);
      expect(article.imageAlt).toMatch(/^رسم بصري مخصص لدليل /);
    });
  });
});
