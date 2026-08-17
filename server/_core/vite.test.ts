import { describe, expect, it } from "vitest";
import { getSsrHeadMeta } from "../../client/src/ssr/meta";
import { buildStructuredData, composeHtml, getLegacyArticleRedirectTarget, getLegacyRedirectTarget } from "./vite";

describe("التحويلات الدائمة وعرض SEO الخادمي", () => {
  it("يحدد وجهة الرابط المفهرس القديم فقط دون إعادة تحويل الرابط القانوني", () => {
    expect(getLegacyArticleRedirectTarget("/articles/riyadh")).toBe("/articles/cleaning-riyadh");
    expect(getLegacyArticleRedirectTarget("/articles/riyadh-service-guide")).toBe("/articles/cleaning-riyadh");
    expect(getLegacyArticleRedirectTarget("/riyadh-service-guide")).toBe("/articles/cleaning-riyadh");
    expect(getLegacyArticleRedirectTarget("/articles/cleaning-riyadh")).toBeUndefined();
    expect(getLegacyArticleRedirectTarget("/privacy")).toBeUndefined();
  });

  it("يوحّد مسار خدمة التنظيف البديل مع المسار القانوني الدائم", () => {
    expect(getLegacyRedirectTarget("/services/cleaning/riyadh")).toBe("/services/home-cleaning/riyadh");
    expect(getLegacyRedirectTarget("/services/home-cleaning/riyadh")).toBeUndefined();
  });

  it("يدمج الوصف العربي للمقال داخل HTML الأولي قبل تشغيل JavaScript", () => {
    const meta = getSsrHeadMeta("/articles/cleaning-riyadh");
    const html = composeHtml("<head><!--app-head--></head><body><!--app-html--></body>", {
      html: "<main>محتوى المقال</main>",
      dehydratedState: {},
      head: meta,
    });

    expect(html).toContain(`<meta name="description" content="${meta.description}" />`);
    expect(html).toContain('rel="canonical" href="https://al-eshraqa.co/articles/cleaning-riyadh"');
    expect(html).toContain("بدء التواصل عبر واتساب");
  });

  it("يربط الصفحة الرئيسية وصفحة عنّا بالنطاق الرسمي وكيان الموقع المنظم", () => {
    const homeSchema = buildStructuredData(getSsrHeadMeta("/"));
    const aboutSchema = buildStructuredData(getSsrHeadMeta("/about"));

    expect(homeSchema["@graph"][0]).toMatchObject({ "@type": "WebSite", url: "https://al-eshraqa.co/", name: "شركة الإشراقة" });
    expect(aboutSchema["@graph"][1]).toMatchObject({ "@type": ["WebPage", "AboutPage"], url: "https://al-eshraqa.co/about", about: { "@id": "https://al-eshraqa.co/#organization" } });
  });
});
