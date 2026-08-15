import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PageMeta from "./PageMeta";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("PageMeta", () => {
  it("يضع وسم كلمات الصفحة الرئيسية بخمس عبارات فقط", () => {
    render(<PageMeta title="تنظيف وصيانة ونقل عفش في السعودية" description="وصف تجريبي" keywords={["شركة تنظيف", "تنظيف منازل", "صيانة منزلية", "نقل عفش", "خدمات منزلية"]} path="/" />);

    const keywords = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    expect(keywords?.content).toBe("شركة تنظيف, تنظيف منازل, صيانة منزلية, نقل عفش, خدمات منزلية");
    expect(keywords?.content.split(",").map((value) => value.trim())).toHaveLength(5);
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe("https://al-eshraqa.co/");
    expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:locale"]')?.content).toBe("ar_SA");
    expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content).toContain("ishraqa-user-logo_64a160a3.png");
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="twitter:card"]')?.content).toBe("summary");
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toContain("index");
  });

  it("يختصر عنوان الأسئلة الشائعة ويذكر اسم الشركة مرة واحدة", () => {
    render(<PageMeta title="أسئلة شائعة | الإشراقة" description="وصف تجريبي" keywords={["أسئلة شائعة"]} path="/faq" />);

    expect(document.title).toBe("الأسئلة الشائعة | شركة الإشراقة");
    expect(document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content).toBe("الأسئلة الشائعة | شركة الإشراقة");
  });
});
