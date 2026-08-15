import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { articleEntries } from "./ArticleDetail";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const sitemap = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");

describe("ملفات SEO الثابتة", () => {
  it("يحافظ على خمس كلمات رئيسية في الصفحة الرئيسية ويربط الشعار ببيانات الموقع", () => {
    const match = indexHtml.match(/<meta name="keywords" content="([^"]+)"\s*\/>/);
    const keywords = match?.[1].split(",").map((keyword) => keyword.trim()) ?? [];

    expect(keywords).toHaveLength(5);
    expect(keywords).toEqual(["شركة تنظيف", "تنظيف منازل", "صيانة منزلية", "نقل عفش", "خدمات منزلية"]);
    expect(indexHtml).toContain('"logo": "https://al-eshraqa.co/manus-storage/ishraqa-original-logo_5e61c480.png"');
    expect(indexHtml).toContain('property="og:image"');
  });

  it("يتضمن رابط كل مقالة من المقالات الـ62 في خريطة الموقع", () => {
    articleEntries.forEach((article) => {
      expect(sitemap).toContain(`<loc>https://al-eshraqa.co/articles/${article.slug}</loc>`);
    });
  });
});
