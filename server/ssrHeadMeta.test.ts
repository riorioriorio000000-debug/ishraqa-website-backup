import { describe, expect, it } from "vitest";
import { getSsrHeadMeta } from "../client/src/ssr/meta";
import { buildHead } from "./_core/vite";

describe("وسوم رأس الصفحة الخادمية", () => {
  it("يعتمد منع الفهرسة للصفحات الخاصة بصيغة متسقة مع انتقالات العميل", () => {
    const head = buildHead(getSsrHeadMeta("/notifications"));

    expect(head).toContain('name="robots" content="noindex, nofollow, noarchive"');
    expect(head).toContain('rel="canonical" href="https://al-eshraqa.co/notifications"');
  });

  it("يبقي الصفحات العامة متاحة للفهرسة مع معاينة صور كبيرة", () => {
    const head = buildHead(getSsrHeadMeta("/about"));

    expect(head).toContain('name="robots" content="index, follow, max-image-preview:large"');
  });
});
