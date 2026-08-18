import { describe, expect, it } from "vitest";
import { isUnsupportedBuildRequest, practicalSiteAnswer } from "./ai";

describe("سياسة مساعد الإشراقة", () => {
  it("ترفض طلبات إنشاء البرمجيات والمواقع", () => {
    expect(isUnsupportedBuildRequest("اكتب لي كود موقع للحجوزات")).toBe(true);
    expect(isUnsupportedBuildRequest("أبغى تطبيق جوال جديد")).toBe(true);
  });

  it("تسمح بأسئلة خدمات الإشراقة المعتادة", () => {
    expect(isUnsupportedBuildRequest("كيف أحجز تنظيف شقة في جدة؟")).toBe(false);
  });

  it("تعرض إجابة تنظيف عملية لسؤال المنزل ولا تكشف مسارًا تقنيًا للزائر", () => {
    const reply = practicalSiteAnswer("كيف أنظف بيتي؟");

    expect(reply).toContain("إزالة الفوضى");
    expect(reply).toContain("من الأعلى إلى الأسفل");
    expect(reply).not.toMatch(/https?:\/\/|\/[a-z]+/i);
  });
});
