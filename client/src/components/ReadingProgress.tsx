import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ReadingProgress() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const isArticle = /^\/articles\/[^/]+$/.test(location);

  useEffect(() => {
    if (!isArticle) {
      setProgress(0);
      return;
    }

    const storageKey = `ishraqa-reading-progress:${location}`;
    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / scrollableHeight) * 100))) : 0;
      setProgress(nextProgress);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ progress: nextProgress, updatedAt: Date.now() }));
      } catch {
        // يبقى الشريط متاحًا حتى عند تعطيل التخزين المحلي في المتصفح.
      }
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [isArticle, location]);

  if (!isArticle) return null;

  return (
    <div className="reading-progress" role="status" aria-live="polite" aria-label={`تقدّم قراءة المقال ${progress}%`}>
      <div className="reading-progress__track" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <span className="reading-progress__label">تقدّم القراءة {progress}%</span>
    </div>
  );
}
