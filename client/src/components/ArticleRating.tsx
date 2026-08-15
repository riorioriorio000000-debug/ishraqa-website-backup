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
  const [isPublic, setIsPublic] = useState(true);
  const effectivePageKey = pageKey || window.location.pathname.split("/").filter(Boolean).pop() || articleTitle;
  const feedback = trpc.interactions.articleFeedback.useQuery({ pageKey: effectivePageKey, visitorId });
  const submit = trpc.interactions.submitArticleFeedback.useMutation({ onSuccess: () => feedback.refetch() });

  useEffect(() => { setVisitorId(getVisitorId()); }, []);
  useEffect(() => {
    if (feedback.data?.ownRating) setRating(feedback.data.ownRating);
    if (feedback.data) setIsPublic(feedback.data.ownIsPublic);
  }, [feedback.data]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!visitorId || !rating) return;
    submit.mutate({ pageKey: effectivePageKey, visitorId, rating, isPublic });
  };

  const summary = feedback.data?.count
    ? `${feedback.data.average} من 5 بناءً على ${feedback.data.count} تقييم${feedback.data.count === 1 ? "" : "ات"}.`
    : "كن أول من يقيّم هذا الدليل.";

  return <section className="article-rating-panel" id="rating" aria-labelledby="article-rating-title">
    <div><span className="eyebrow"><i /> رأيك في المقال</span><h2 id="article-rating-title">هل كان دليل «{articleTitle}» مفيدًا؟</h2><p>يمكنك التقييم الآن فقط، ثم إضافة تعليقك لاحقًا. التحكم في ظهور التقييم متاح دائمًا.</p></div>
    <form onSubmit={onSubmit}>
      <div className="article-stars" aria-label="اختر تقييمك للمقال">
        {[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} className={value <= rating ? "active" : ""} aria-label={`${value} نجوم`} aria-pressed={value === rating}><Star size={22} fill="currentColor" /></button>)}
      </div>
      <p className="article-rating-summary" aria-live="polite">{summary}</p>
      <label className="article-rating-visibility"><input type="checkbox" checked={isPublic} onChange={event => setIsPublic(event.target.checked)} /> إظهار تقييمي للعامة وعرضه بجانب تعليقي إن أضفته لاحقًا.</label>
      <button className="article-rate-submit" disabled={!visitorId || !rating || submit.isPending} type="submit">{submit.isPending ? "جارٍ الحفظ…" : feedback.data?.ownRating ? "تحديث تقييمي" : "حفظ التقييم"}</button>
      {submit.isSuccess && <p className="article-rating-status">تم حفظ تقييمك. يمكنك إضافة تعليق في القسم التالي متى أردت.</p>}
      {submit.isError && <p className="article-rating-status error">تعذر حفظ التقييم الآن. حاول مرة أخرى.</p>}
    </form>
  </section>;
}
