import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import VideoEngagementMeta from "@/components/VideoEngagementMeta";
import VideoWatchDialog from "@/components/VideoWatchDialog";
import { getServiceVideoPoster } from "@/data/serviceMedia";
import { getVideoKey, type WorkVideo } from "@/data/workVideos";

type ServiceVideoProps = WorkVideo & {
  featured?: boolean;
  compact?: boolean;
};

export default function ServiceVideo({ title, description, src, serviceLabel, servicePath, featured = false, compact = false }: ServiceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchOpen, setWatchOpen] = useState(false);
  const videoKey = getVideoKey(src);
  const poster = getServiceVideoPoster(src);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !window.IntersectionObserver) {
      setShouldLoadVideo(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShouldLoadVideo(true);
      observer.disconnect();
    }, { rootMargin: "360px 0px" });
    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) return;

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
    return () => {
      video.removeEventListener("timeupdate", syncProgress);
      video.removeEventListener("loadedmetadata", syncProgress);
      video.removeEventListener("play", syncPlaying);
      video.removeEventListener("pause", syncPlaying);
      video.removeEventListener("ended", syncPlaying);
    };
  }, [shouldLoadVideo]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    const nextSoundOn = !soundOn;
    video.muted = !nextSoundOn;
    setSoundOn(nextSoundOn);
    try {
      if (video.paused) await video.play();
    } catch {
      video.muted = true;
      setSoundOn(false);
    }
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  return (
    <article className={`service-video-card${featured ? " featured" : ""}${compact ? " compact" : ""}`}>
      <div ref={mediaRef} className="service-video-media" role="button" tabIndex={0} onClick={() => setWatchOpen(true)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setWatchOpen(true); } }} aria-label={`فتح نافذة مشاهدة فيديو ${title}`}>
        {shouldLoadVideo ? <><video ref={videoRef} poster={poster} muted={!soundOn} playsInline preload="metadata" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} aria-label={`فيديو توضيحي لخدمة ${title}`}>
          <source src={src} type="video/mp4" />
        </video>
        <div className="video-controls" aria-label={`عناصر تحكم فيديو ${title}`}>
          <button type="button" className="video-control-button" onClick={(event) => { event.stopPropagation(); void togglePlayback(); }} aria-pressed={isPlaying} aria-label={isPlaying ? "إيقاف الفيديو مؤقتًا" : "تشغيل الفيديو"}>
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <input className="video-progress" type="range" min="0" max="100" step="0.1" value={progress} onClick={(event) => event.stopPropagation()} onChange={(event) => seek(Number(event.target.value))} aria-label="التقدم في الفيديو" />
          <button type="button" className="video-control-button video-sound-toggle" onClick={(event) => { event.stopPropagation(); void toggleSound(); }} aria-pressed={soundOn} aria-label={soundOn ? "إيقاف صوت الفيديو" : "تشغيل صوت الفيديو"}>
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            <span>{soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}</span>
          </button>
        </div><span className="video-watch-hint" aria-hidden="true">افتح الفيديو والتفاعل</span></> : <div className="service-video-placeholder" style={{ backgroundImage: `url(${poster})` }} aria-label={`معاينة مرئية لخدمة ${title}`} />}
      </div>
      <div className="service-video-copy">
        <span className="eyebrow"><i /> من واقع الخدمة</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="service-video-footer"><VideoEngagementMeta videoKey={videoKey} compact /><Link href={servicePath} className="service-video-service-link">{serviceLabel}</Link></div>
      </div>
      <VideoWatchDialog open={watchOpen} onOpenChange={setWatchOpen} title={title} description={description} src={src} poster={poster} videoKey={videoKey} />
    </article>
  );
}
