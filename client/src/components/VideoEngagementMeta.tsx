import { Eye, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

import { createClientId } from "@/lib/uuid";
const visitorStorageKey = "ishraqa-anonymous-visitor";

function getVisitorId() {
  const saved = localStorage.getItem(visitorStorageKey);
  if (saved) return saved;
  const created = createClientId();
  localStorage.setItem(visitorStorageKey, created);
  return created;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

type VideoEngagementMetaProps = {
  videoKey: string;
  compact?: boolean;
};

/** Displays first-party view and like totals, while preserving the anonymous one-like-per-video rule. */
export default function VideoEngagementMeta({ videoKey, compact = false }: VideoEngagementMetaProps) {
  const [visitorId, setVisitorId] = useState<string>();
  const [pulse, setPulse] = useState(false);
  const engagement = trpc.interactions.videoEngagement.useQuery({ videoKey, visitorId });
  const toggleLike = trpc.interactions.toggleVideoLike.useMutation({ onSuccess: () => void engagement.refetch() });

  useEffect(() => setVisitorId(getVisitorId()), []);

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!visitorId || toggleLike.isPending) return;
    setPulse(true);
    window.setTimeout(() => setPulse(false), 280);
    toggleLike.mutate({ videoKey, visitorId });
  };

  return <div className={`video-engagement-meta${compact ? " compact" : ""}`} aria-label="إحصاءات وتفاعل الفيديو">
    <span className="video-view-count"><Eye size={14} aria-hidden="true" /><span>{formatCount(engagement.data?.views ?? 0)}</span><span className="sr-only"> مشاهدة</span></span>
    <button type="button" className={`${engagement.data?.liked ? "active" : ""}${pulse ? " is-reacting" : ""}`} onClick={toggle} disabled={!visitorId || toggleLike.isPending} aria-label={engagement.data?.liked ? "إلغاء الإعجاب بالفيديو" : "الإعجاب بالفيديو"} aria-pressed={engagement.data?.liked ?? false}>
      <Heart size={14} fill={engagement.data?.liked ? "currentColor" : "none"} aria-hidden="true" /><span>{formatCount(engagement.data?.likes ?? 0)}</span>
    </button>
  </div>;
}
