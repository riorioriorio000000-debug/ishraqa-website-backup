import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

function getVisitorId() {
  const key = "ishraqa-anonymous-visitor";
  const known = localStorage.getItem(key);
  if (known) return known;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

export default function ArticleRating({ articleTitle, pageKey }: { articleTitle: string; pageKey?: string }) {
  const [visitorId, setVisitorId] = useState<string>();
  const [rating, setRating] = useState(0);
  const effectivePageKey = pageKey || articleTitle;
  const feedback = trpc.interactions.articleFeedback.useQuery({ pageKey: effectivePageKey, visitorId });
  const submit = trpc.interactions.submitArticleFeedback.useMutation({ onSuccess: () => void feedback.refetch() });

  useEffect(() => setVisitorId(getVisitorId()), []);
  useEffect(() => {
    if (feedback.data?.ownRating) setRating(feedback.data.ownRating);
  }, [feedback.data?.ownRating]);

  function chooseRating(value: number) {
    if (!visitorId || submit.isPending) return;
    setRating(value);
    submit.mutate({ pageKey: effectivePageKey, visitorId, rating: value, isPublic: true });
  }

  const summary = feedback.data?.count
    ? `${feedback.data.average} من 5 من ${feedback.data.count} تقييم${feedback.data.count === 1 ? "" : "ات"}`
    : "لا توجد تقييمات منشورة بعد";

  return <section className="article-rating-panel" id="rating" aria-label={`تقييم مقال ${articleTitle}`}>
    <div className="article-stars" aria-label="اختر تقييمك للمقال">
      {[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => chooseRating(value)} disabled={!visitorId || submit.isPending} className={value <= rating ? "active" : ""} aria-label={`${value} من 5 نجوم`} aria-pressed={value === rating}><Star size={24} fill="currentColor" /></button>)}
    </div>
    <p className="article-rating-summary" aria-live="polite">{submit.isPending ? "جارٍ حفظ تقييمك…" : summary}</p>
  </section>;
}
