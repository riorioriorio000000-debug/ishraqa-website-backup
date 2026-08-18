import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
const services = readFileSync(new URL("../client/src/pages/StaticPage.tsx", import.meta.url), "utf8");
const articles = readFileSync(new URL("../client/src/pages/ArticleDetail.tsx", import.meta.url), "utf8");
const ourWork = readFileSync(new URL("../client/src/pages/OurWorkPage.tsx", import.meta.url), "utf8");
const serviceMedia = readFileSync(new URL("../client/src/data/serviceMedia.ts", import.meta.url), "utf8");
const videoComponent = readFileSync(new URL("../client/src/components/ServiceVideo.tsx", import.meta.url), "utf8");
const videoDialog = readFileSync(new URL("../client/src/components/VideoWatchDialog.tsx", import.meta.url), "utf8");
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

  it("يحافظ على تحميل خفيف ويستأنف التشغيل عند تفعيل الصوت", () => {
    expect(videoComponent).toContain('preload="metadata"');
    expect(videoComponent).toContain("playsInline");
    expect(videoComponent).toContain("IntersectionObserver");
    expect(videoComponent).toContain("muted={!soundOn}");
    expect(videoComponent).toContain("if (video.paused) await video.play()");
    expect(videoComponent).not.toContain(" controls ");
    expect(videoComponent).not.toContain("controlsList");
    expect(videoComponent).toContain('className="video-controls"');
    expect(videoComponent).toContain('className="video-progress"');
    expect(videoComponent).toContain("togglePlayback");
    expect(videoComponent).toContain("تشغيل الصوت");
  });

  it("يجمع جميع المقاطع المعتمدة في صفحة أعمالنا ضمن بطاقات صغيرة", () => {
    expect(ourWork).toContain('path="/our-work"');
    expect(ourWork).toContain("ishraqa-upholstery-work-01_c6221152.mp4");
    expect(ourWork).toContain("ishraqa-upholstery-work-02_f51aee76.mp4");
    expect(ourWork).toContain("ishraqa-oven-work-01_28be488e.mp4");
    expect(ourWork).toContain("ishraqa-oven-work-02_eec8b074.mp4");
    expect(ourWork).toContain("serviceMedia.ac.video");
    expect(ourWork).toContain("serviceMedia.tank.video");
    expect(serviceMedia).toContain("ishraqa-ac-work_9f225e58.mp4");
    expect(serviceMedia).toContain("ishraqa-tank-work_4c069ae7.mp4");
    expect(ourWork).toContain("compact");
    expect(meta).toContain('"/our-work"');
  });

  it("يعرّف بيانات فيديو منظمة للصفحات ذات المقاطع الحقيقية", () => {
    expect(meta).toContain("video?: { name: string; description: string; contentUrl: string; uploadDate: string }");
    expect(meta).toContain('"/manus-storage/ishraqa-upholstery-work-01_c6221152.mp4"');
    expect(meta).toContain('"/manus-storage/ishraqa-oven-work-01_28be488e.mp4"');
    expect(ssr).toContain('"@type": "VideoObject"');
    expect(ssr).toContain("contentUrl: absoluteUrl(meta.video.contentUrl)");
    expect(ssr).toContain("thumbnailUrl: absoluteUrl(meta.image");
  });

  it("يتيح عرض المقاطع في نافذة تفاعلية دون إظهار تعليقات أو تقييمات مصطنعة", () => {
    expect(videoComponent).toContain("VideoWatchDialog");
    expect(videoDialog).toContain("ArticleComments pageKey={videoKey}");
    expect(videoDialog).toContain("showLinkedRating");
    expect(videoDialog).toContain("toggleLike.mutate");
    expect(videoDialog).toContain("video-watch-dialog");
  });
});
