import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const manifest = readFileSync(new URL("../public/site.webmanifest", import.meta.url), "utf8");

describe("هوية الشعار في الأصول العامة", () => {
  it("يوحد أيقونة الرابط وApple Touch Icon وPWA مع الشعار المعتمد", () => {
    const logoPath = "/ishraqa-website-backup/media/sofa.jpg";

    expect(indexHtml).toContain(`<link rel="icon" href="${logoPath}"`);
    expect(indexHtml).toContain(`<link rel="apple-touch-icon" href="${logoPath}"`);
    expect(indexHtml).toContain(`"logo": "https://al-eshraqa.co${logoPath}"`);
    expect(manifest).toContain(`"src": "${logoPath}"`);
  });
});
