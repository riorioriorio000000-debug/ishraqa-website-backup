import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

describe("SEO للصفحة الرئيسية", () => {
  it("يحمل عنوانًا ووصفًا وكلمات مفتاحية ضمن الحدود المطلوبة ويعرض H2 وصفيًا", () => {
    expect(homeSource).toContain('title="شركة الاشراقة | للخدمات المنزلية في السعودية"');
    expect(homeSource).toContain('description="شركة الإشراقة للخدمات المنزلية في السعودية: تنظيف المنازل والأثاث، صيانة المكيفات، مكافحة الحشرات، تنسيق الحدائق، ونقل العفش."');

    const keywordsMatch = homeSource.match(/keywords=\{\[([^\]]+)\]\}/);
    const keywords = keywordsMatch?.[1].match(/"[^"]+"/g) ?? [];
    expect(keywords).toHaveLength(8);

    const h2Match = homeSource.match(/<h2>نرتّب التفاصيل بهدوء،<br \/><em>لتعود إلى يومك بخفة\.<\/em><\/h2>/);
    expect(h2Match).not.toBeNull();
    expect("نرتّب التفاصيل بهدوء، لتعود إلى يومك بخفة.".length).toBeLessThanOrEqual(80);
  });

  it("يضع نصًا بديلًا وصفيًا لكل الصور المستخدمة في الصفحة الرئيسية", () => {
    const images = [...homeSource.matchAll(/<img\b[^>]*>/g)];
    expect(images).toHaveLength(6);
    expect(images.every(([image]) => /\balt=(?:"[^"]+"|\{[^}]+\})/.test(image))).toBe(true);
    expect(homeSource).toContain('alt="رسم شفاف لصندوق أدوات تنظيف الإشراقة"');
    expect(homeSource).toContain('alt={`رسم توضيحي لخدمة ${title} من شركة الإشراقة`}');
    expect(homeSource).toContain('alt="رسم أدوات الصيانة المنزلية المستخدمة في خدمات الإشراقة"');
    expect(homeSource).toContain('alt="خريطة مدن تغطية شركة الإشراقة في السعودية"');
    expect(homeSource.match(/loading="lazy" decoding="async"/g)).toHaveLength(5);
    expect(homeSource).toContain('decoding="async" fetchPriority="high"');
  });
});
