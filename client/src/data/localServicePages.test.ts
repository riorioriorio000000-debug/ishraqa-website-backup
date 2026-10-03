import { describe, expect, it } from "vitest";
import { getLocalServicePage, getLocalServicePagePath, localServicePages } from "./localServicePages";

describe("صفحات الخدمة والمدينة", () => {
  it("تنشئ صفحة مستقلة لكل تقاطع خدمة ومدينة ضمن النطاق المعتمد", () => {
    expect(localServicePages).toHaveLength(126);
    expect(getLocalServicePage("home-cleaning", "riyadh")?.title).toContain("الرياض");
    expect(getLocalServicePage("cleaning", "riyadh")?.title).toContain("الرياض");
    expect(getLocalServicePage("ac-maintenance", "jeddah")?.keywords).toContain("صيانة تكييف جدة");
  });

  it("يوفر مسارًا قانونيًا ثابتًا للروابط الداخلية والـSSR", () => {
    expect(getLocalServicePagePath("furniture-moving", "makkah")).toBe("/services/furniture-moving/makkah");
    expect(getLocalServicePage("not-a-service", "riyadh")).toBeUndefined();
  });

  it("يحافظ على أسئلة شائعة ومعلومات حقيقية قابلة للقراءة في كل صفحة", () => {
    const page = getLocalServicePage("pest-control", "abha");
    expect(page?.faq).toHaveLength(5);
    expect(page?.neighbourhoods.length).toBeGreaterThanOrEqual(4);
    expect(page?.serviceSteps).toHaveLength(3);
    expect(page?.cityTips).toHaveLength(3);
    expect(page?.image).toBe("/ishraqa-website-backup/media/sofa.jpg");
    expect(page?.imageAlt).toContain("مكافحة حشرات");
    expect(page?.description).not.toMatch(/الأرخص|مضمون|الأولى/);
  });

  it("يحافظ على عنوان موجز ووصف وصورة مشاركة لكل صفحة محلية", () => {
    for (const page of localServicePages) {
      expect(page.title.length).toBeLessThanOrEqual(60);
      expect(page.description.length).toBeLessThanOrEqual(180);
      expect(page.image).toMatch(/^(\/manus-storage\/|https:\/\/)/);
    }
  });
});
