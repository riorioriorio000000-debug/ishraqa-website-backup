import { describe, expect, it } from "vitest";
import { browseFailureMessage } from "./chatMessages";

describe("browseFailureMessage", () => {
  it("يعيد رسالة مساعد عربية واضحة مع سبب آمن", () => {
    expect(browseFailureMessage("لا يمكن فتح عنوان محلي.")).toBe(
      "تعذر تلخيص الرابط الآن. لا يمكن فتح عنوان محلي."
    );
  });

  it("يضيف إرشادًا عمليًا حين لا يتوفر سبب تفصيلي", () => {
    expect(browseFailureMessage()).toContain("تأكد أن الرابط عام");
  });
});
