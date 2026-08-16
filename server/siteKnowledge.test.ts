import { describe, expect, it } from "vitest";
import { classifySiteQuestion, recommendSiteContent } from "./siteKnowledge";

describe("recommendSiteContent", () => {
  it("يصنّف سؤال الزائر بحسب الخدمة والمدينة", () => {
    expect(classifySiteQuestion("أحتاج صيانة مكيف في الرياض")).toEqual({ service: "maintenance", city: "الرياض" });
  });

  it("يعرض دليلاً متخصصًا للخدمة ودليلاً محليًا للمدينة ذاتها", () => {
    const cards = recommendSiteContent("أريد نقل عفش في جدة");
    expect(cards.map((card) => card.id)).toEqual(["moving-service", "moving-guide", "moving-jeddah-guide"]);
    expect(cards.at(-1)).toMatchObject({ title: "دليل جدة لتجهيز طلب الخدمة", href: "/articles/moving-jeddah" });
  });

  it("يعيد توصيات عامة آمنة عندما لا يذكر السائل نوع خدمة", () => {
    expect(recommendSiteContent("كيف يمكنني الحجز؟").map((card) => card.id)).toEqual(["cleaning-service", "maintenance-service", "booking"]);
  });
});
