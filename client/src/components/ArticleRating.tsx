import { Star } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ArticleRating({ articleTitle }: { articleTitle: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const submit = trpc.feedback.submit.useMutation();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating) return;
    submit.mutate({ rating, comment: comment.trim() ? `تقييم لمقال «${articleTitle}»: ${comment.trim()}` : undefined });
  };

  return <section className="article-rating-panel" id="rating" aria-labelledby="article-rating-title">
    <div><span className="eyebrow"><i /> رأيك في المقال</span><h2 id="article-rating-title">هل كان هذا الدليل مفيدًا؟</h2><p>اختر عدد النجوم المناسب. الملاحظة اختيارية، ولا نضع أرقامًا أو آراء غير موثقة.</p></div>
    <form onSubmit={onSubmit}>
      <div className="article-stars" aria-label="اختر تقييمك للمقال">
        {[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} className={value <= rating ? "active" : ""} aria-label={`${value} نجوم`}><Star size={22} fill="currentColor" /></button>)}
      </div>
      <label className="sr-only" htmlFor="article-rating-comment">ملاحظتك عن المقال</label>
      <textarea id="article-rating-comment" maxLength={620} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="اكتب ملاحظة اختيارية إن رغبت…" />
      <button className="article-rate-submit" disabled={!rating || submit.isPending} type="submit">{submit.isPending ? "جارٍ الإرسال…" : "إرسال التقييم"}</button>
      {submit.isSuccess && <p className="article-rating-status">شكرًا لك. نُشر تقييمك الآن.</p>}
      {submit.isError && <p className="article-rating-status error">تعذر الإرسال الآن. حاول مرة أخرى.</p>}
    </form>
  </section>;
}
