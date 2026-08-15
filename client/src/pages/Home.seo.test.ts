import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

describe("SEO للصفحة الرئيسية", () => {
  it("يضع نصًا بديلًا وصفيًا لكل الصور المستخدمة في الصفحة الرئيسية", () => {
    const images = [...homeSource.matchAll(/<img\b[^>]*>/g)];
    expect(images).toHaveLength(4);
    expect(images.every(([image]) => /\balt=(?:"[^"]+"|\{`[^`]+`\})/.test(image))).toBe(true);
    expect(homeSource).toContain('alt="رسم شفاف لصندوق أدوات تنظيف الإشراقة"');
    expect(homeSource).toContain('alt={`رسم توضيحي لخدمة ${title} من شركة الإشراقة`}');
    expect(homeSource).toContain('alt="رسم أدوات الصيانة المنزلية المستخدمة في خدمات الإشراقة"');
    expect(homeSource).toContain('alt="خريطة مدن تغطية شركة الإشراقة في السعودية"');
    expect(homeSource.match(/loading="lazy" decoding="async"/g)).toHaveLength(3);
    expect(homeSource).toContain('decoding="async" fetchPriority="high"');
  });
});
