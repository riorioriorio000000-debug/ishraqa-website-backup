import { describe, expect, it } from "vitest";
import { buildPlatformShareUrl, getOfficialShareUrl } from "./SiteShareDialog";

describe("مشاركة صفحات الإشراقة", () => {
  it("تبني رابطًا قانونيًا على النطاق الرسمي", () => {
    expect(getOfficialShareUrl("/articles/cleaning-riyadh?source=site")).toBe("https://al-eshraqa.co/articles/cleaning-riyadh?source=site");
    expect(getOfficialShareUrl("https://preview.example/articles/cleaning-riyadh")).toBe("https://al-eshraqa.co/articles/cleaning-riyadh");
  });

  it("يضمّن الرابط والعنوان في قنوات المشاركة المدعومة", () => {
    const request = { title: "دليل التنظيف", text: "اقرأ دليل التنظيف", url: "https://al-eshraqa.co/articles/cleaning-riyadh" };
    expect(buildPlatformShareUrl("whatsapp", request)).toContain(encodeURIComponent(request.url));
    expect(buildPlatformShareUrl("facebook", request)).toContain(encodeURIComponent(request.url));
    expect(buildPlatformShareUrl("x", request)).toContain(encodeURIComponent(request.text));
    expect(buildPlatformShareUrl("telegram", request)).toContain(encodeURIComponent(request.url));
  });
});
