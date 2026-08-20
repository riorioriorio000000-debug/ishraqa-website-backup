import { describe, expect, it } from "vitest";
import { getSsrHeadMeta } from "../client/src/ssr/meta";
import { buildStructuredData } from "./_core/vite";

describe("البيانات المنظمة للصفحات المحلية", () => {
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
});
