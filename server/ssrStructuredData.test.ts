import { describe, expect, it } from "vitest";
import { getSsrHeadMeta } from "../client/src/ssr/meta";
import { buildStructuredData } from "./_core/vite";

describe("البيانات المنظمة للصفحات المحلية", () => {
  it("يضيف FAQPage للصفحة الرئيسية من الأسئلة الظاهرة نفسها", () => {
    const meta = getSsrHeadMeta("/");
    const graph = buildStructuredData(meta)["@graph"] as Array<Record<string, unknown>>;
    const faq = graph.find((node) => node["@type"] === "FAQPage");

    expect(faq).toMatchObject({
      mainEntity: expect.arrayContaining([
        expect.objectContaining({ "@type": "Question", name: "هل تقدم الإشراقة تنظيف منازل في الرياض وجدة؟" }),
      ]),
    });
    expect((faq?.mainEntity as unknown[]) ?? []).toHaveLength(meta.faq?.length ?? 0);
  });

  it("تضيف مسار تنقل وأسئلة شائعة مطابقة للنص المرئي لصفحة الخدمة والمدينة", () => {
    const meta = getSsrHeadMeta("/services/pest-control/riyadh");
    const graph = buildStructuredData(meta)["@graph"] as Array<Record<string, unknown>>;
    const breadcrumbs = graph.find((node) => node["@type"] === "BreadcrumbList");
    const faq = graph.find((node) => node["@type"] === "FAQPage");

    expect(breadcrumbs).toMatchObject({
      itemListElement: expect.arrayContaining([
        expect.objectContaining({ position: 1, name: "الرئيسية", item: "https://al-eshraqa.co/" }),
        expect.objectContaining({ position: 3, name: meta.breadcrumbs?.[2]?.name, item: "https://al-eshraqa.co/services/pest-control/riyadh" }),
      ]),
    });
    expect(faq).toMatchObject({
      mainEntity: expect.arrayContaining([
        expect.objectContaining({ "@type": "Question", name: meta.faq?.[0]?.question }),
      ]),
    });
    expect((faq?.mainEntity as unknown[]) ?? []).toHaveLength(meta.faq?.length ?? 0);
  });

  it("لا يضيف FAQPage عندما لا توجد أسئلة مرئية مرتبطة بالصفحة", () => {
    const graph = buildStructuredData(getSsrHeadMeta("/about"))["@graph"] as Array<Record<string, unknown>>;
    expect(graph.some((node) => node["@type"] === "FAQPage")).toBe(false);
  });

  it("يصف قائمة خدمات المؤسسة الفعلية من دون أسعار أو عروض غير منشورة", () => {
    const graph = buildStructuredData(getSsrHeadMeta("/"))["@graph"] as Array<Record<string, unknown>>;
    const organization = graph.find((node) => node["@type"] === "Organization");
    const catalog = organization?.hasOfferCatalog as { "@type"?: string; itemListElement?: Array<{ itemOffered?: { "@type"?: string; name?: string } }> } | undefined;

    expect(catalog?.["@type"]).toBe("OfferCatalog");
    expect(catalog?.itemListElement).toEqual(expect.arrayContaining([
      expect.objectContaining({ itemOffered: expect.objectContaining({ "@type": "Service", name: "تنظيف المنازل" }) }),
      expect.objectContaining({ itemOffered: expect.objectContaining({ "@type": "Service", name: "نقل العفش" }) }),
    ]));
    expect(JSON.stringify(catalog)).not.toContain("price");
  });
});
