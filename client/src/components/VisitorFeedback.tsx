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

export default function VisitorFeedback() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const visits = trpc.interactions.visitorCount.useQuery();
  const recordVisit = trpc.interactions.recordVisitor.useMutation({ onSuccess: () => visits.refetch() });
  const feedback = trpc.feedback.listPublished.useQuery();
  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setComment("");
      feedback.refetch();
    },
  });

  useEffect(() => {
    recordVisit.mutate({ visitorId: getVisitorId() });
  }, []);

  return (
    <section className="section feedback-section" dir="rtl">
      <div className="shell feedback-grid">
        <div>
          <span className="eyebrow"><i /> صوت الزائر</span>
          <h2>رأيك يساعدنا على تحسين التجربة.</h2>
          <p>يعرض الموقع عدد الزيارات بصورة إجمالية. أما التقييمات والتعليقات فلا تظهر للعامة إلا بعد مراجعة الإدارة، ولذلك لا نعرض أي تقييمات غير حقيقية.</p>
          <div className="visit-count"><span>{visits.data ?? 0}</span><small>زائر مجهول مسجل للموقع</small></div>
        </div>
        <form className="feedback-form" onSubmit={(event) => { event.preventDefault(); submit.mutate({ rating, comment }); }}>
          <strong>شارك ملاحظتك</strong>
          <div className="rating-input" aria-label="اختر التقييم">
            {[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} نجوم`} className={value <= rating ? "active" : ""}><Star size={20} fill="currentColor" /></button>)}
          </div>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} minLength={10} maxLength={800} placeholder="اكتب ملاحظتك عن تجربتك في الموقع أو الخدمة..." required />
          <button type="submit" className="button" disabled={submit.isPending}>{submit.isPending ? "جارٍ الإرسال…" : "إرسال للمراجعة"}</button>
          {submit.isSuccess && <p className="form-status">شكرًا لك. استلمنا رأيك للمراجعة.</p>}
          {submit.isError && <p className="form-status error">تعذر حفظ الرأي الآن، حاول لاحقًا.</p>}
        </form>
      </div>
    </section>
  );
}
