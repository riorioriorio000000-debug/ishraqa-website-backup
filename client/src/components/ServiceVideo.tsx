import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ServiceVideoProps = {
  title: string;
  description: string;
  src: string;
  featured?: boolean;
};

export default function ServiceVideo({ title, description, src, featured = false }: ServiceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

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

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextSoundOn = !soundOn;
    video.muted = !nextSoundOn;
    setSoundOn(nextSoundOn);
    if (nextSoundOn) video.play().catch(() => setSoundOn(false));
  };

  return (
    <article className={`service-video-card${featured ? " featured" : ""}`}>
      <div ref={mediaRef} className="service-video-media">
        {shouldLoadVideo ? <><video ref={videoRef} autoPlay loop muted playsInline preload="metadata" aria-label={`فيديو توضيحي لخدمة ${title}`}>
          <source src={src} type="video/mp4" />
        </video>
        <button type="button" className="video-sound-toggle" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "إيقاف صوت الفيديو" : "تشغيل صوت الفيديو"}>
          {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          <span>{soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}</span>
        </button></> : <div className="service-video-placeholder" aria-label={`معاينة مرئية لخدمة ${title}`} />}
      </div>
      <div className="service-video-copy">
        <span className="eyebrow"><i /> من واقع الخدمة</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
