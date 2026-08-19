import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dialog = readFileSync(new URL("./VideoWatchDialog.tsx", import.meta.url), "utf8");
const serviceVideo = readFileSync(new URL("./ServiceVideo.tsx", import.meta.url), "utf8");
const comments = readFileSync(new URL("./ArticleComments.tsx", import.meta.url), "utf8");
const schema = readFileSync(new URL("../../../drizzle/schema.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("../../../server/routers.ts", import.meta.url), "utf8");

describe("نافذة فيديو أعمال الإشراقة", () => {
  it("تفتح نافذة مشاهدة متاحة مع إغلاق واضح وتحكم صوت وتقدم مستقلين", () => {
    expect(dialog).toContain('role="dialog"');
    expect(dialog).toContain('aria-modal="true"');
    expect(dialog).toContain('aria-label="إغلاق مشاهدة الفيديو"');
    expect(dialog).toContain('aria-label="التقدم في الفيديو"');
    expect(dialog).toContain("closeOnEscape");
    expect(dialog).toContain('document.body.style.overflow = "hidden"');
    expect(dialog).not.toContain("controlsList");
  });

  it("يستخدم تفاعلات حقيقية مرتبطة بالفيديو ولا يضيف تقييماً أو تعليقاً صوريًا", () => {
    expect(dialog).toContain("ArticleComments key={activeVideoKey} pageKey={activeVideoKey}");
    expect(dialog).toContain("showLinkedRating");
    expect(dialog).toContain("اكتب تعليقًا");
    expect(dialog).toContain('querySelector<HTMLTextAreaElement>("textarea")?.focus');
    expect(dialog).toContain("toggleLike.mutate");
    expect(dialog).toContain("readVisitorId");
    expect(schema).toContain("videoLikes");
    expect(schema).toContain("video_likes_visitor_unique");
    expect(router).toContain("toggleVideoLike");
    expect(router).toContain("videoLike");
  });

  it("يعرض عداد التعليقات ويدعم فرزها والردود المباشرة داخل نافذة الفيديو", () => {
    expect(dialog).toContain("videoComments.data?.length ?? 0");
    expect(dialog).toContain("showSortControls");
    expect(comments).toContain('showSortControls = false');
    expect(comments).toContain('setSortOrder("newest")');
    expect(comments).toContain('setSortOrder("engagement")');
    expect(comments).toContain("الأكثر تفاعلًا");
    expect(comments).toContain("comment-reply-action");
    expect(comments).toContain("openReply(comment.id");
  });

  it("يضع تأكيد نشر تعليق الفيديو الصغير فوق المشغل بدل رسالة عامة", () => {
    expect(dialog).toContain("video-comment-success-notice");
    expect(dialog).toContain('role="status"');
    expect(dialog).toContain("onCommentPublished={handleVideoCommentPublished}");
    expect(dialog).toContain("suppressSuccessToast");
    expect(comments).toContain("suppressSuccessToast = false");
    expect(comments).toContain("onCommentPublished?.()");
  });

  it("يعرض اقتراحات حقيقية ومشاركة مختصرة دون بيانات أو روابط مصطنعة", () => {
    expect(dialog).toContain("فيديوهات ذات صلة");
    expect(dialog).toContain("workVideos.filter");
    expect(dialog).toContain("relatedVideos.map");
    expect(dialog).not.toContain("getServiceVideoPoster");
    expect(dialog).toContain("نسخ الرابط");
    expect(dialog).toContain('buildPlatformShareUrl("whatsapp"');
    expect(dialog).toContain('buildPlatformShareUrl("facebook"');
  });

  it("يحتفظ بحركات فتح وإغلاق وتفاعل القلب ضمن تفضيل تقليل الحركة", () => {
    expect(dialog).toContain('data-state={isClosing ? "closed" : "open"}');
    expect(dialog).toContain("likePulse");
    const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
    expect(styles).toContain("video-dialog-out");
    expect(styles).toContain("video-heart-pop");
    expect(styles).toContain("prefers-reduced-motion: no-preference");
  });

  it("يُبقي بطاقة الفيديو خفيفة ويتيح فتح المشاهدة التفصيلية بالنقر", () => {
    expect(serviceVideo).toContain("VideoWatchDialog");
    expect(serviceVideo).toContain("setWatchOpen(true)");
    expect(serviceVideo).toContain('preload="metadata"');
    expect(serviceVideo).toContain("showPreviewFrame");
    expect(serviceVideo).not.toContain(" controls ");
    expect(serviceVideo).not.toContain("poster=");
    expect(serviceVideo).toContain("video.defaultMuted = false");
    expect(serviceVideo).toContain("video.volume = 1");
    expect(dialog).not.toContain("poster=");
    expect(dialog).toContain("video.defaultMuted = false");
  });

  it("يعرض الفيديوهات داخل إطار أفقي متوازن بخلفية سوداء ويحتوي المقطع كاملًا", () => {
    const styles = readFileSync(new URL("../index.css", import.meta.url), "utf8");
    expect(styles).toContain(".service-video-media {");
    expect(styles).toContain("aspect-ratio: 16 / 9");
    expect(styles).toContain("background: #000");
    expect(styles).toContain("object-fit: contain");
    expect(styles).toContain(".our-work-video-grid .service-video-media");
  });
});
