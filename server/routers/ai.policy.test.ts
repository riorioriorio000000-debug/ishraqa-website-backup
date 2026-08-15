import { describe, expect, it } from "vitest";
import { isUnsupportedBuildRequest } from "./ai";

describe("سياسة مساعد الإشراقة", () => {
  it("ترفض طلبات إنشاء البرمجيات والمواقع", () => {
    expect(isUnsupportedBuildRequest("اكتب لي كود موقع للحجوزات")).toBe(true);
    expect(isUnsupportedBuildRequest("أبغى تطبيق جوال جديد")).toBe(true);
  });

  it("تسمح بأسئلة خدمات الإشراقة المعتادة", () => {
    expect(isUnsupportedBuildRequest("كيف أحجز تنظيف شقة في جدة؟")).toBe(false);
  });
});
