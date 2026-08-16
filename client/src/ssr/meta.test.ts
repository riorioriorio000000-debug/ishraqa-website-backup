import { describe, expect, it } from "vitest";
import { getSsrHeadMeta } from "./meta";

describe("البيانات الوصفية للعرض الخادمي", () => {
  it("ينشئ للصفحة الرئيسية عنوانًا ووصفًا وcanonical محليًا دون حشو أو وعود ترتيب", () => {
    const meta = getSsrHeadMeta("/");

    expect(meta.title).toBe("شركة تنظيف وصيانة في السعودية | شركة الإشراقة");
    expect(meta.description).toContain("تنظيف المنازل");
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

  it("يحجب صفحات الإشعارات عن الفهرسة ويعيد حالة not-found للمسارات غير المعروفة", () => {
    expect(getSsrHeadMeta("/notification-preferences").noindex).toBe(true);
    expect(getSsrHeadMeta("/not-a-page")).toMatchObject({ noindex: true, notFound: true });
  });
});
