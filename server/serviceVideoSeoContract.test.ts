import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const services = readFileSync(new URL("../client/src/pages/StaticPage.tsx", import.meta.url), "utf8");
const articles = readFileSync(new URL("../client/src/pages/ArticleDetail.tsx", import.meta.url), "utf8");
const videoComponent = readFileSync(new URL("../client/src/components/ServiceVideo.tsx", import.meta.url), "utf8");
const meta = readFileSync(new URL("../client/src/ssr/meta.ts", import.meta.url), "utf8");
const ssr = readFileSync(new URL("../server/_core/vite.ts", import.meta.url), "utf8");

describe("فيديوهات أعمال الإشراقة", () => {
  it("يعرض المقاطع الحقيقية في مواضعها المعتمدة من دون بقاء المقاطع الإعلانية القديمة", () => {
    expect(home).toContain("ishraqa-upholstery-work-01_c6221152.mp4");
    expect(home).not.toContain("ad-home-cleaning_8b448cef.mp4");
    expect(services).toContain("ishraqa-upholstery-work-02_f51aee76.mp4");
    expect(services).toContain("ishraqa-oven-work-01_28be488e.mp4");
    expect(services).not.toContain("ad-maintenance_ab0928ad.mp4");
    expect(services).not.toContain("ad-moving_5126576b.mp4");
    expect(articles).toContain("ishraqa-oven-work-02_eec8b074.mp4");
  });

  it("يحافظ على تحميل خفيف وتشغيل صامت، مع إبقاء الصوت اختيارياً بيد الزائر", () => {
    expect(videoComponent).toContain('preload="metadata"');
    expect(videoComponent).toContain("playsInline");
    expect(videoComponent).toContain("IntersectionObserver");
    expect(videoComponent).toContain("autoPlay loop muted playsInline");
    expect(videoComponent).toContain("تشغيل الصوت");
  });

  it("يعرّف بيانات فيديو منظمة للصفحات ذات المقاطع الحقيقية", () => {
    expect(meta).toContain("video?: { name: string; description: string; contentUrl: string; uploadDate: string }");
    expect(meta).toContain('"/manus-storage/ishraqa-upholstery-work-01_c6221152.mp4"');
    expect(meta).toContain('"/manus-storage/ishraqa-oven-work-01_28be488e.mp4"');
    expect(ssr).toContain('"@type": "VideoObject"');
    expect(ssr).toContain("contentUrl: absoluteUrl(meta.video.contentUrl)");
  });
});
