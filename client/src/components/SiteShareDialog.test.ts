import { describe, expect, it } from "vitest";
import { buildEmailShareUrl, buildPlatformShareUrl, buildShareText, COPY_SUCCESS_MESSAGE, getOfficialShareUrl } from "./SiteShareDialog";

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

  it("يجهّز البريد الإلكتروني بعنوان ورسالة ورابط الصفحة", () => {
    const request = { title: "دليل التنظيف", text: "اقرأ دليل التنظيف", url: "https://al-eshraqa.co/articles/cleaning-riyadh" };
    const emailUrl = buildEmailShareUrl(request);
    expect(emailUrl).toMatch(/^mailto:\?subject=/);
    expect(emailUrl).toContain(encodeURIComponent(request.title));
    expect(emailUrl).toContain(encodeURIComponent(request.url));
  });

  it("يبني نصًا افتراضيًا يضم عنوان المقالة ووصفها المختصر", () => {
    const title = "شركة تنظيف في الرياض";
    const description = "دليل مختصر لترتيب خدمة تنظيف منزلية في الرياض.";
    const text = buildShareText(title, description);
    expect(text).toContain(title);
    expect(text).toContain(description);
    expect(buildEmailShareUrl({ title, text, url: "https://al-eshraqa.co/articles/cleaning-riyadh" })).toContain(encodeURIComponent(description));
  });

  it("يستخدم رسالة نجاح واضحة بعد نسخ الرابط", () => {
    expect(COPY_SUCCESS_MESSAGE).toBe("تم نسخ رابط الصفحة، يمكنك مشاركته الآن.");
  });
});
