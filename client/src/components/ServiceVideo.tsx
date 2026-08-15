import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

type ServiceVideoProps = {
  title: string;
  description: string;
  src: string;
  featured?: boolean;
};

export default function ServiceVideo({ title, description, src, featured = false }: ServiceVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

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
      <div className="service-video-media">
        <video ref={videoRef} autoPlay loop muted playsInline preload="metadata" aria-label={`فيديو توضيحي لخدمة ${title}`}>
          <source src={src} type="video/mp4" />
        </video>
        <button type="button" className="video-sound-toggle" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "إيقاف صوت الفيديو" : "تشغيل صوت الفيديو"}>
          {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          <span>{soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}</span>
        </button>
      </div>
      <div className="service-video-copy">
        <span className="eyebrow"><i /> من واقع الخدمة</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
