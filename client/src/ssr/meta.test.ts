import { describe, expect, it } from "vitest";
import { articleEntries } from "@/pages/ArticleDetail";
import { getLocalServicePagePath, localServicePages } from "@/data/localServicePages";
import { getLegacyArticleRedirectPath, getSitemapPaths, getSsrHeadMeta } from "./meta";

describe("البيانات الوصفية للعرض الخادمي", () => {
  it("ينشئ للصفحة الرئيسية العنوان والوصف المعتمدين وcanonical محليًا دون وعود ترتيب", () => {
    const meta = getSsrHeadMeta("/");

    expect(meta.title).toBe("شركة الاشراقة | للخدمات المنزلية في السعودية");
    expect(meta.description).toBe("خدمات متنوعة تٌلبي كل احتياجات بيتك · نظافة الأثاث المنزلي · النظافة التأهيلية · مكافحة الحشرات · الصيانة المنزلية · تنسيق الحدائق · نقل الأثاث · خدمة التنظيف بالساعة.");
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

  it("ينشئ صفحة خدمة ومدينة مستقلة بعنوان ووصف وصورة وسجل sitemap", () => {
    const path = "/services/home-cleaning/riyadh";
    const meta = getSsrHeadMeta(path);

    expect(meta.canonicalPath).toBe(path);
    expect(meta.title).toContain("تنظيف منازل");
    expect(meta.title).toContain("الرياض");
    expect(meta.description).toContain("واتساب");
    expect(meta.image).toContain("/manus-storage/");
    expect(meta.ogType).toBe("article");
    expect(getSitemapPaths()).toContain(path);
  });

  it("يدرج جميع الصفحات العامة والمقالات والأدلة المحلية القانونية في خريطة الموقع", () => {
    const sitemapPaths = getSitemapPaths();
    const publicPagePaths = ["/", "/services", "/booking", "/calculator", "/articles", "/where-we-work", "/about", "/faq", "/customer-service", "/privacy"];

    expect(sitemapPaths).toHaveLength(publicPagePaths.length + articleEntries.length + localServicePages.length);
    expect(sitemapPaths).toEqual(expect.arrayContaining(publicPagePaths));
    expect(sitemapPaths).toEqual(expect.arrayContaining(articleEntries.map((article) => `/articles/${article.slug}`)));
    expect(sitemapPaths).toEqual(expect.arrayContaining(localServicePages.map((page) => getLocalServicePagePath(page.serviceSlug, page.citySlug))));
    expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length);
  });

  it("يحجب صفحات الإشعارات عن الفهرسة ويعيد حالة not-found للمسارات غير المعروفة", () => {
    expect(getSsrHeadMeta("/notification-preferences").noindex).toBe(true);
    expect(getSsrHeadMeta("/not-a-page")).toMatchObject({ noindex: true, notFound: true });
  });
});
