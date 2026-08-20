import { describe, expect, it } from "vitest";
import { workPhotos } from "./workPhotos";

describe("صور أعمال الإشراقة", () => {
  it("لا تستخدم إلا صورة ميدانية فوتوغرافية متحققة مع نص بديل وصلة خدمة", () => {
    expect(workPhotos).toHaveLength(1);
    expect(new Set(workPhotos.map((photo) => photo.src)).size).toBe(workPhotos.length);
    for (const photo of workPhotos) {
      expect(photo.src).toMatch(/^\/manus-storage\//);
      expect(photo.alt.trim().length).toBeGreaterThan(20);
      expect(photo.alt).not.toMatch(/أفضل|الأرخص|مضمون|#/);
      expect(photo.servicePath).toMatch(/^\/services\//);
    }
  });

  it("يربط المعرض بصورة تنظيف الخزان الفوتوغرافية لا برسومات تجهيزات الخدمة", () => {
    expect(workPhotos).toEqual([
      expect.objectContaining({
        src: "/manus-storage/tank-cleaning-interior_db42a79e.jpg",
        servicePath: "/services/tank-cleaning/riyadh",
      }),
    ]);
    expect(workPhotos[0].alt).toMatch(/خزان مياه منزلي أثناء التنظيف/);
  });
});
