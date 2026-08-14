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
  });
});
