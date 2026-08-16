import { describe, expect, it } from "vitest";
import { getLegacyArticleRedirectPath, getSsrHeadMeta } from "./meta";

describe("البيانات الوصفية للعرض الخادمي", () => {
  it("ينشئ للصفحة الرئيسية عنوانًا ووصفًا وcanonical محليًا دون حشو أو وعود ترتيب", () => {
    const meta = getSsrHeadMeta("/");

    expect(meta.title).toBe("شركة تنظيف وصيانة في السعودية | شركة الإشراقة");
    expect(meta.description).toContain("تنظيف المنازل");
    expect(meta.canonicalPath).toBe("/");
    expect(meta.keywords).toContain("شركة تنظيف في الخرج");
    expect(meta.description).not.toMatch(/الصفحة الأولى|الأقل سعرًا|مضمون/);
  });

  it("ينشئ بيانات مستقلة وقابلة للفهرسة لكل مقال محلي", () => {
    const meta = getSsrHeadMeta("/articles/cleaning-al-kharj");

    expect(meta.canonicalPath).toBe("/articles/cleaning-al-kharj");
    expect(meta.ogType).toBe("article");
    expect(meta.title).toContain("الخرج");
    expect(meta.description.length).toBeGreaterThan(30);
  });

  it("يطبع وصفًا عربيًا واضحًا ودون عبارة التنسيق القديمة للدليل المحلي", () => {
    const meta = getSsrHeadMeta("/articles/cleaning-riyadh");

    expect(meta.description).toContain("دليل محلي لسكان الرياض");
    expect(meta.description).toContain("بدء التواصل عبر واتساب");
    expect(meta.description).not.toContain("قبل تنسيق الموعد");
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it("يوحّد المسارات القديمة للمقالات إلى الرابط القانوني القابل للفهرسة", () => {
    expect(getLegacyArticleRedirectPath("riyadh")).toBe("/articles/cleaning-riyadh");
    expect(getLegacyArticleRedirectPath("riyadh-service-guide")).toBe("/articles/cleaning-riyadh");
    expect(getLegacyArticleRedirectPath("cleaning-riyadh")).toBeUndefined();
    expect(getSsrHeadMeta("/articles/riyadh-service-guide")).toMatchObject({
      canonicalPath: "/articles/cleaning-riyadh",
      ogType: "article",
    });
  });

  it("يحجب صفحات الإشعارات عن الفهرسة ويعيد حالة not-found للمسارات غير المعروفة", () => {
    expect(getSsrHeadMeta("/notification-preferences").noindex).toBe(true);
    expect(getSsrHeadMeta("/not-a-page")).toMatchObject({ noindex: true, notFound: true });
  });
});
