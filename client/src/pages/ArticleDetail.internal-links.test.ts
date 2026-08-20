import { describe, expect, it } from "vitest";
import { articleEntries, getRelatedLocalServicePage } from "./ArticleDetail";

describe("روابط المقالات المحلية إلى صفحات الخدمة", () => {
  it("تعرض وجهة خدمة ومدينة مؤكدة فقط عندما تكون الصفحة المحلية موجودة", () => {
    const riyadhGuide = articleEntries.find((article) => article.slug === "cleaning-riyadh");
    const matchedPage = riyadhGuide ? getRelatedLocalServicePage(riyadhGuide) : undefined;

    expect(matchedPage).toMatchObject({
      serviceSlug: "home-cleaning",
      citySlug: "riyadh",
      serviceName: "تنظيف المنازل",
      cityName: "الرياض",
    });
  });

  it("لا يخترع رابط خدمة محليًا عندما لا تكون المدينة ضمن التغطية المنشورة", () => {
    const uncoveredGuide = articleEntries.find((article) => article.localCitySlug === "al-kharj");
    expect(uncoveredGuide && getRelatedLocalServicePage(uncoveredGuide)).toBeUndefined();
  });
});
