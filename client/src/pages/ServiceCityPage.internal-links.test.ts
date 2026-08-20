import { describe, expect, it } from "vitest";
import { getLocalServicePage } from "@/data/localServicePages";
import { getRelatedArticlesForLocalService } from "./ServiceCityPage";

describe("الروابط العكسية لصفحات الخدمة المحلية", () => {
  it("يضع الدليل المحلي المطابق في بداية الروابط المقترحة", () => {
    const page = getLocalServicePage("home-cleaning", "riyadh");
    expect(page).toBeTruthy();
    expect(getRelatedArticlesForLocalService(page!).at(0)?.slug).toBe("cleaning-riyadh");
  });
});
