import { ArrowLeft, Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import ArticleComments from "@/components/ArticleComments";
import VideoEngagementMeta from "@/components/VideoEngagementMeta";
import { trpc } from "@/lib/trpc";
import { buildPlatformShareUrl, buildShareText, getOfficialShareUrl } from "@/components/SiteShareDialog";
import { getVideoKey, workVideos } from "@/data/workVideos";

type VideoWatchDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description: string;
  src: string;
  videoKey: string;
};

function readVisitorId() {
  const storageKey = "ishraqa-anonymous-visitor";
  const saved = window.localStorage.getItem(storageKey);
  if (saved) return saved;
  const created = crypto.randomUUID();
  window.localStorage.setItem(storageKey, created);
  return created;
}

export default function VideoWatchDialog({ open, onOpenChange, title, description, src, videoKey }: VideoWatchDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visitorId, setVisitorId] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
  const [isMounted, setIsMounted] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [activeVideo, setActiveVideo] = useState({ title, description, src, videoKey });
  const activeVideoKey = getVideoKey(activeVideo.src);
  const engagement = trpc.interactions.videoEngagement.useQuery({ videoKey: activeVideoKey, visitorId });
  const toggleLike = trpc.interactions.toggleVideoLike.useMutation({ onSuccess: () => void engagement.refetch() });
  const recordVideoView = trpc.interactions.recordVideoView.useMutation({ onSuccess: () => void engagement.refetch() });
  const relatedVideos = useMemo(() => workVideos.filter((video) => video.src !== activeVideo.src).slice(0, 3), [activeVideo.src]);
  const shareRequest = useMemo(() => ({
    title: activeVideo.title,
    text: buildShareText(activeVideo.title, activeVideo.description),
    url: getOfficialShareUrl(`/our-work#${activeVideoKey}`),
  }), [activeVideo.description, activeVideo.title, activeVideoKey]);

  useEffect(() => {
    if (open) {
      setActiveVideo({ title, description, src, videoKey });
      setIsMounted(true);
      setIsClosing(false);
      return;
    }
    if (!isMounted) return;
    setIsClosing(true);
    const timer = window.setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
    }, 190);
    return () => window.clearTimeout(timer);
  }, [description, isMounted, open, src, title, videoKey]);

  useEffect(() => {
    if (!open) return;
    setVisitorId(readVisitorId());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [open, onOpenChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !open) return;
    video.load();
    const syncProgress = () => {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      setProgress(duration ? (video.currentTime / duration) * 100 : 0);
    };
    const syncPlaying = () => setIsPlaying(!video.paused && !video.ended);
    video.addEventListener("timeupdate", syncProgress);
    video.addEventListener("loadedmetadata", syncProgress);
    video.addEventListener("play", syncPlaying);
    video.addEventListener("pause", syncPlaying);
    video.addEventListener("ended", syncPlaying);
    return () => { video.removeEventListener("timeupdate", syncProgress); video.removeEventListener("loadedmetadata", syncProgress); video.removeEventListener("play", syncPlaying); video.removeEventListener("pause", syncPlaying); video.removeEventListener("ended", syncPlaying); };
  }, [activeVideo.src, open]);

  useEffect(() => {
    if (!open || !visitorId) return;
    const sessionKey = `ishraqa-video-viewed:${activeVideoKey}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    recordVideoView.mutate({ videoKey: activeVideoKey, visitorId });
  }, [activeVideoKey, open, recordVideoView, visitorId]);

  useEffect(() => {
    if (!commentsOpen) return;
    const frame = window.requestAnimationFrame(() => {
      const comments = document.getElementById(`${activeVideoKey}-comments`);
      if (!comments) return;
      comments.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      comments.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeVideoKey, commentsOpen]);

  const close = () => {
    videoRef.current?.pause();
    onOpenChange(false);
  };

  const chooseRelatedVideo = (nextVideo: typeof workVideos[number]) => {
    videoRef.current?.pause();
    setActiveVideo({ ...nextVideo, videoKey: getVideoKey(nextVideo.src) });
    setIsPlaying(false);
    setSoundOn(false);
    setProgress(0);
    setCommentsOpen(false);
    setShareOpen(false);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareRequest.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("انسخ رابط الفيديو من هنا:", shareRequest.url);
    }
  };

  const handleLike = () => {
    if (!visitorId || toggleLike.isPending) return;
    setLikePulse(true);
    window.setTimeout(() => setLikePulse(false), 360);
    toggleLike.mutate({ videoKey: activeVideoKey, visitorId });
  };
  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { try { await video.play(); } catch { setIsPlaying(false); } } else video.pause();
  };
  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.muted) { video.muted = true; setSoundOn(false); return; }
    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;
    try { await video.play(); setSoundOn(true); } catch { video.muted = true; setSoundOn(false); }
  };
  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  if (!isMounted || typeof document === "undefined") return null;
  return createPortal(<div className="video-watch-backdrop" data-state={isClosing ? "closed" : "open"} role="presentation" onMouseDown={close}>
    <section className="video-watch-dialog" data-state={isClosing ? "closed" : "open"} role="dialog" aria-modal="true" aria-labelledby={`${activeVideoKey}-title`} onMouseDown={(event) => event.stopPropagation()} dir="rtl">
      <button type="button" className="video-watch-close" onClick={close} aria-label="إغلاق مشاهدة الفيديو">×</button>
      <div className="video-watch-head"><span className="eyebrow"><i /> أعمال الإشراقة</span><h2 id={`${activeVideoKey}-title`}>{activeVideo.title}</h2><p>{activeVideo.description}</p></div>
      <div className="video-watch-stage">
        <video ref={videoRef} muted={!soundOn} playsInline preload="metadata" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} aria-label={`فيديو ${activeVideo.title}`}><source src={activeVideo.src} type="video/mp4" /></video>
        <div className="video-watch-controls" aria-label={`عناصر تحكم فيديو ${activeVideo.title}`}>
          <button type="button" onClick={togglePlayback} aria-pressed={isPlaying}>{isPlaying ? "إيقاف" : "تشغيل"}</button>
          <input type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => seek(Number(event.target.value))} aria-label="التقدم في الفيديو" />
          <button type="button" onClick={toggleSound} aria-pressed={soundOn}>{soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}</button>
        </div>
      </div>
      <div className="video-watch-actions" aria-label="التفاعل مع الفيديو">
        <button type="button" className={`video-heart${engagement.data?.liked ? " active" : ""}${likePulse ? " is-reacting" : ""}`} onClick={handleLike} disabled={!visitorId || toggleLike.isPending} aria-pressed={engagement.data?.liked ?? false}><span aria-hidden="true">♥</span> {engagement.data?.liked ? "أعجبك الفيديو" : "أعجبني"}<small>{engagement.data?.likes ?? 0}</small></button>
        <button type="button" className="video-share-toggle" onClick={() => setShareOpen((value) => !value)} aria-expanded={shareOpen} aria-controls={`${activeVideoKey}-share`}><Share2 size={16} aria-hidden="true" /> مشاركة</button>
        <button type="button" className="video-comments-toggle" onClick={() => setCommentsOpen(value => !value)} aria-expanded={commentsOpen} aria-controls={`${activeVideoKey}-comments`}><MessageCircle size={16} aria-hidden="true" /> {commentsOpen ? "إخفاء التعليقات" : "اكتب تعليقًا"}</button>
      </div>
      {shareOpen && <div id={`${activeVideoKey}-share`} className="video-share-menu" aria-label="خيارات مشاركة الفيديو">
        <button type="button" onClick={() => void copyShareLink()}>{copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}<span>{copied ? "تم النسخ" : "نسخ الرابط"}</span></button>
        <a href={buildPlatformShareUrl("whatsapp", shareRequest)} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden="true" /><span>واتساب</span></a>
        <a href={buildPlatformShareUrl("facebook", shareRequest)} target="_blank" rel="noreferrer"><strong aria-hidden="true">f</strong><span>فيسبوك</span></a>
      </div>}
      <section className="video-watch-related" aria-labelledby={`${activeVideoKey}-related`}>
        <div className="video-watch-related-heading"><span className="eyebrow"><i /> استكشف المزيد</span><h3 id={`${activeVideoKey}-related`}>فيديوهات ذات صلة</h3></div>
        <div className="video-watch-related-list">{relatedVideos.map((relatedVideo) => <article key={relatedVideo.src}><button type="button" onClick={() => chooseRelatedVideo(relatedVideo)} aria-label={`مشاهدة فيديو مرتبط: ${relatedVideo.title}`}><span>{relatedVideo.title}</span></button><div className="video-watch-related-meta"><VideoEngagementMeta videoKey={getVideoKey(relatedVideo.src)} compact /><Link href={relatedVideo.servicePath} onClick={(event) => event.stopPropagation()}>{relatedVideo.serviceLabel} <ArrowLeft size={13} aria-hidden="true" /></Link></div></article>)}</div>
      </section>
      {commentsOpen && <div id={`${activeVideoKey}-comments`} className="video-watch-comments"><ArticleComments key={activeVideoKey} pageKey={activeVideoKey} showLinkedRating sectionId={`${activeVideoKey}-comments`} /></div>}
    </section>
  </div>, document.body);
}
