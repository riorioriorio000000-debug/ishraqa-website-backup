import { describe, expect, it } from "vitest";
import { articleEntries } from "./ArticleDetail";

describe("محتوى الأدلة المحلية", () => {
  it("يضيف إرشادًا عمليًا خاصًا بكل خدمة فوق بنية الدليل العام", () => {
    const localGuides = articleEntries.filter((article) => article.category === "دليل محلي");

    expect(localGuides).not.toHaveLength(0);
    expect(localGuides.every((article) => article.sections.length >= 10)).toBe(true);
    expect(localGuides.some((article) => article.sections.some(([heading]) => heading === "دوّن علامة التكييف كما ظهرت"))).toBe(true);
    expect(localGuides.some((article) => article.sections.some(([heading]) => heading === "افصل قائمة القطع الحساسة عن بقية النقل"))).toBe(true);
    expect(localGuides.some((article) => article.sections.some(([heading]) => heading === "حدّد السطح أو الجهاز قبل اختيار طريقة العناية"))).toBe(true);
  });
});
