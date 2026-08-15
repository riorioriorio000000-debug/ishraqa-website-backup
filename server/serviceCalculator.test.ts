import { describe, expect, it } from "vitest";
import { calculateServicePlan } from "../shared/serviceCalculator";

describe("calculateServicePlan", () => {
  it("يحول تفاصيل النقل إلى رسالة واتساب واضحة من دون تسعير ثابت", () => {
    const plan = calculateServicePlan({ service: "moving", property: "villa", size: "large", city: "الرياض" });

    expect(plan.message).toContain("نقل عفش");
    expect(plan.message).toContain("فيلا");
    expect(plan.message).toContain("الرياض");
    expect(plan.focus).toContain("التغليف");
    expect(plan.visitLevel).toContain("معاينة");
    expect(plan.message).not.toMatch(/[٠-٩0-9]+\s*(ريال|ر\.س)/);
  });

  it("يستخدم مدينة بديلة عندما يترك العميل حقل المدينة فارغًا", () => {
    const plan = calculateServicePlan({ service: "cleaning", property: "apartment", size: "small", city: "" });

    expect(plan.message).toContain("مدينة أخرى");
    expect(plan.focus).toContain("المطبخ");
  });

  it("يضيف الوصف الحر إلى الرسالة حتى لا يقتصر الطلب على الاختيارات الجاهزة", () => {
    const plan = calculateServicePlan({ service: "maintenance", property: "office", size: "medium", city: "جدة", details: "المكيف يصدر صوتًا بعد الظهر" });

    expect(plan.message).toContain("المكيف يصدر صوتًا بعد الظهر");
    expect(plan.message).not.toMatch(/[٠-٩0-9]+\s*(ريال|ر\.س)/);
  });
});
