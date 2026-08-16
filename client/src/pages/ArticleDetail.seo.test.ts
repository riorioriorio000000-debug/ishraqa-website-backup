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
      expect(article.shareImage).toMatch(/^https:\/\/al-eshraqa\.co\/manus-storage\/.+\.png$/);
      expect(article.sections.length).toBeGreaterThanOrEqual(21);
      const wordCount = [article.title, article.intro, ...article.sections.flatMap(([heading, body]) => [heading, body])].join(" ").trim().split(/\s+/).filter(Boolean).length;
      expect(wordCount).toBeGreaterThanOrEqual(1500);
    });
    expect(articleEntries.filter((article) => article.category === "دليل رئيسي").every((article) => article.image && article.imageAlt)).toBe(true);
  });

  it("يربط الصور التحريرية المضغوطة بالتسعة مقالات المحلية المختارة", () => {
    const expectedVisuals = [
      "/manus-storage/article-visual-bathroom-care_9449151f.webp",
      "/manus-storage/article-visual-ac-maintenance_e644ca83.webp",
      "/manus-storage/article-visual-moving-plan_3fb9a477.webp",
      "/manus-storage/article-visual-kitchen-deep-clean_f5c395b7.webp",
      "/manus-storage/article-visual-scheduled-care_47ea76e0.webp",
      "/manus-storage/article-visual-sofa-care_0001dda1.webp",
      "/manus-storage/article-visual-window-care_5fb807c6.webp",
      "/manus-storage/article-visual-marble-care_b0c1f72f.webp",
      "/manus-storage/article-visual-exterior-care_8deeb043.webp",
    ];

    const illustratedLocalArticles = articleEntries.filter((article) => article.category === "دليل محلي" && article.image);
    expect(illustratedLocalArticles).toHaveLength(expectedVisuals.length);
    expect(illustratedLocalArticles.map((article) => article.image)).toEqual(expect.arrayContaining(expectedVisuals));
    illustratedLocalArticles.forEach((article) => expect(article.imageAlt?.trim()).not.toBe(""));
  });
});
