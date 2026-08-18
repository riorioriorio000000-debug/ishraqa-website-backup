import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ArticleComments from "@/components/ArticleComments";
import { trpc } from "@/lib/trpc";

type VideoWatchDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description: string;
  src: string;
  poster: string;
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

export default function VideoWatchDialog({ open, onOpenChange, title, description, src, poster, videoKey }: VideoWatchDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visitorId, setVisitorId] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const likes = trpc.interactions.videoLike.useQuery({ videoKey, visitorId });
  const toggleLike = trpc.interactions.toggleVideoLike.useMutation({ onSuccess: () => void likes.refetch() });

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
  }, [open]);

  const close = () => {
    videoRef.current?.pause();
    onOpenChange(false);
  };
  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { try { await video.play(); } catch { setIsPlaying(false); } } else video.pause();
  };
  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    const nextSoundOn = !soundOn;
    video.muted = !nextSoundOn;
    setSoundOn(nextSoundOn);
    if (video.paused) { try { await video.play(); } catch { video.muted = true; setSoundOn(false); } }
  };
  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  if (!open || typeof document === "undefined") return null;
  return createPortal(<div className="video-watch-backdrop" role="presentation" onMouseDown={close}>
    <section className="video-watch-dialog" role="dialog" aria-modal="true" aria-labelledby={`${videoKey}-title`} onMouseDown={(event) => event.stopPropagation()} dir="rtl">
      <button type="button" className="video-watch-close" onClick={close} aria-label="إغلاق مشاهدة الفيديو">×</button>
      <div className="video-watch-head"><span className="eyebrow"><i /> أعمال الإشراقة</span><h2 id={`${videoKey}-title`}>{title}</h2><p>{description}</p></div>
      <div className="video-watch-stage">
        <video ref={videoRef} poster={poster} muted={!soundOn} playsInline preload="metadata" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} aria-label={`فيديو ${title}`}><source src={src} type="video/mp4" /></video>
        <div className="video-watch-controls" aria-label={`عناصر تحكم فيديو ${title}`}>
          <button type="button" onClick={togglePlayback} aria-pressed={isPlaying}>{isPlaying ? "إيقاف" : "تشغيل"}</button>
          <input type="range" min="0" max="100" step="0.1" value={progress} onChange={(event) => seek(Number(event.target.value))} aria-label="التقدم في الفيديو" />
          <button type="button" onClick={toggleSound} aria-pressed={soundOn}>{soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}</button>
        </div>
      </div>
      <div className="video-watch-actions" aria-label="التفاعل مع الفيديو">
        <button type="button" className={`video-heart${likes.data?.liked ? " active" : ""}`} onClick={() => visitorId && toggleLike.mutate({ videoKey, visitorId })} disabled={!visitorId || toggleLike.isPending} aria-pressed={likes.data?.liked ?? false}><span aria-hidden="true">♥</span> {likes.data?.liked ? "أعجبك الفيديو" : "أعجبني"}<small>{likes.data?.count ?? 0}</small></button>
        <button type="button" className="video-comments-toggle" onClick={() => setCommentsOpen(value => !value)} aria-expanded={commentsOpen} aria-controls={`${videoKey}-comments`}>{commentsOpen ? "إخفاء التعليقات والتقييم" : "عرض التعليقات والتقييم"}</button>
      </div>
      {commentsOpen && <div id={`${videoKey}-comments`} className="video-watch-comments"><ArticleComments pageKey={videoKey} showLinkedRating sectionId={`${videoKey}-comments`} /></div>}
    </section>
  </div>, document.body);
}
