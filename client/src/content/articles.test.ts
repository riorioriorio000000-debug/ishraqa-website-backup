import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { articles, articleCategories, getArticleBySlug } from "./articles";

describe("مكتبة مقالات الإشراقة", () => {
  it("تحتوي على مقالات قابلة للفهرسة بعناوين ووصف وروابط فريدة", () => {
    expect(articles.length).toBe(47);
    expect(new Set(articles.map((article) => article.slug)).size).toBe(articles.length);
    for (const article of articles) {
      expect(article.title.trim().length).toBeGreaterThan(20);
      expect(article.description.trim().length).toBeGreaterThan(70);
      expect(article.focusKeyword.trim().length).toBeGreaterThan(2);
      expect(article.body.trim().length).toBeGreaterThan(400);
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("يستخرج المقال من الرابط ويحافظ على تصنيفات قابلة للتصفية", () => {
    const first = articles[0];
    expect(getArticleBySlug(first.slug)?.id).toBe(first.id);
    expect(getArticleBySlug("missing-article")).toBeUndefined();
    expect(articleCategories.length).toBeGreaterThan(2);
  });

  it("يوفر للقارئ مشاركة عملية وبيانات اجتماعية وغلافًا غير بشريًا", () => {
    const template = readFileSync(resolve(process.cwd(), "client/src/pages/ArticlePages.tsx"), "utf8");
    expect(template).toContain("https://wa.me/?text=");
    expect(template).toContain("https://www.facebook.com/sharer/sharer.php");
    expect(template).toContain("navigator.clipboard");
    expect(template).toContain("og:image");
    expect(template).toContain("twitter:image");
    expect(template).toContain('alt={article.imageAlt}');
  });
});
