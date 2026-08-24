import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { articleEntries } from "./ArticleDetail";
import { getSitemapPaths, getSsrHeadMeta } from "../ssr/meta";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("ملفات SEO وبصمة العرض الخادمي", () => {
  it("يولّد كلمات الصفحة الرئيسية وعنوانها المعتمد ويربط الشعار ببيانات الموقع", () => {
    const home = getSsrHeadMeta("/");

    expect(home.keywords).toEqual(["شركة تنظيف في السعودية", "شركة صيانة في السعودية", "تنظيف منازل", "تنظيف كنب", "صيانة مكيفات", "نقل عفش", "شركة تنظيف في الخرج", "خدمات منزلية"]);
    expect(home.title).toBe("شركة الاشراقة | للخدمات المنزلية في السعودية");
    expect(home.description).toBe("شركة الإشراقة للخدمات المنزلية في السعودية: تنظيف المنازل والأثاث، صيانة المكيفات، مكافحة الحشرات، تنسيق الحدائق، ونقل العفش.");
    expect(home.description.length).toBeLessThanOrEqual(160);
    expect(home.canonicalPath).toBe("/");
    expect(indexHtml).toContain('"logo": "https://al-eshraqa.co/manus-storage/ishraqa-user-logo_64a160a3.png"');
    expect(indexHtml).toContain("<!--app-head-->");
  });

  it("يتضمن رابط كل مقالة في مصدر خريطة الموقع الحية", () => {
    articleEntries.forEach((article) => {
      expect(getSitemapPaths()).toContain(`/articles/${article.slug}`);
    });
  });
});
