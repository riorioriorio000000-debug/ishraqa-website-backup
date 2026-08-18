import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serviceCitySource = readFileSync(new URL("../client/src/pages/ServiceCityPage.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

describe("دليل الخدمة والمدينة", () => {
  it("يستخدم مكوّنًا ديناميكيًا واحدًا لجميع المدن والخدمات", () => {
    expect(serviceCitySource).toContain('useRoute("/services/:serviceSlug/:citySlug")');
    expect(serviceCitySource).toContain('className="service-city-page"');
  });

  it("يحافظ على خلفية بطل أزرق فاتح ونصوص واضحة بدل التدرج الداكن السابق", () => {
    expect(styles).toContain("linear-gradient(135deg,#edf7ff,#dceefe 57%,#c6e1f4)");
    expect(styles).toContain(".service-city-hero h1 { max-width:18ch; color:#173f5d");
    expect(styles).toContain(".service-city-hero p { color:#315b78;");
    expect(styles).not.toContain("background:linear-gradient(135deg,#0c5056,#174f4e 54%,#8a6e38)");
  });
});
