import React, { FormEvent, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Sparkles, Star, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type QuestionAnswer = {
  reply: string;
  workSummary?: string;
  navigation: readonly { label: string; href: string }[];
  contentCards: { id: string; kind: string; title: string; description: string; href: string }[];
  recommendationContext: { service: "cleaning" | "maintenance" | "moving" | "general"; city?: string };
};

const ratingLabels = ["غير مفيدة", "تحتاج تحسينًا", "مقبولة", "مفيدة", "مفيدة جدًا"];

function createFeedbackId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "00000000-0000-4000-8000-000000000000";
}

export default function QuickServiceQuestion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const saveFeedback = trpc.feedback.submitAssistantAnswer.useMutation({ onSuccess: () => setFeedbackSaved(true) });
  const ask = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setAnswer({
        reply: data.reply,
        workSummary: data.workSummary?.join(" • "),
        navigation: data.navigation,
        contentCards: data.contentCards,
        recommendationContext: data.recommendationContext,
      });
      setFeedbackId(createFeedbackId());
      setSelectedRating(null);
      setFeedbackSaved(false);
      setIsAnswerOpen(true);
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = question.trim();
    if (!content || ask.isPending) return;
    setAnswer(null);
    setIsAnswerOpen(false);
    ask.mutate({ messages: [{ role: "user", content }], pageContext: { title: "الأسئلة الشائعة", url: "/faq" } });
  }

  function rateAnswer(rating: number) {
    if (!answer || !feedbackId || saveFeedback.isPending) return;
    setSelectedRating(rating);
    setFeedbackSaved(false);
    saveFeedback.mutate({
      id: feedbackId,
      rating,
      service: answer.recommendationContext.service,
      city: answer.recommendationContext.city,
      contentCardIds: answer.contentCards.map((card) => card.id),
    });
  }

  return <section className="quick-service-question" aria-labelledby="quick-service-question-title">
    <div className="quick-service-question-copy"><span className="eyebrow"><Sparkles size={15} /> اسأل المساعد</span><h2 id="quick-service-question-title">لم تجد إجابتك؟<br /><em>اكتب سؤالك بطريقتك.</em></h2><p>يشرح لك مساعد الإشراقة الخطوة المناسبة اعتمادًا على معلومات الموقع، ثم يمكنك متابعة التفاصيل مع فريق الخدمة.</p></div>
    <div className="quick-service-question-panel">
      <form onSubmit={submit}>
        <label htmlFor="quick-service-question-input">اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش</label>
        <textarea id="quick-service-question-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="مثال: ما المعلومات التي أحتاجها قبل طلب تنظيف شقة؟" rows={3} maxLength={800} disabled={ask.isPending} />
        <button className="button" type="submit" disabled={!question.trim() || ask.isPending}>{ask.isPending ? <><LoaderCircle size={17} className="spin" /> يجهّز الإجابة…</> : <>اسأل الآن <ArrowLeft size={16} /></>}</button>
      </form>
      {ask.error && <p className="quick-service-question-error" role="alert">تعذر تجهيز الإجابة الآن. يمكنك المحاولة مرة أخرى أو التواصل عبر واتساب.</p>}
    </div>
    <Dialog open={isAnswerOpen} onOpenChange={setIsAnswerOpen}>
      <DialogContent className="quick-service-answer-dialog" showCloseButton={false} dir="rtl" aria-describedby="quick-service-answer-description">
        <DialogClose className="quick-service-answer-close" aria-label="إغلاق إجابة المساعد"><X size={18} aria-hidden="true" /></DialogClose>
        <DialogHeader>
          <span className="quick-service-answer-kicker"><Sparkles size={15} aria-hidden="true" /> إجابة المساعد</span>
          <DialogTitle>إجابة مرتبطة بموقع الإشراقة</DialogTitle>
          <DialogDescription id="quick-service-answer-description">يمكنك الانتقال إلى الصفحة أو المقال المقترح مباشرة.</DialogDescription>
        </DialogHeader>
        {answer && <div className="quick-service-answer-body" aria-live="polite">
          <p className="quick-service-answer-reply">{answer.reply}</p>
          {answer.workSummary && <p className="quick-service-answer-summary">{answer.workSummary}</p>}
          {answer.contentCards.length > 0 && <section aria-labelledby="quick-service-content-links"><h3 id="quick-service-content-links">محتوى مقترح</h3><div className="quick-service-content-cards">{answer.contentCards.map((card) => <Link key={card.id} href={card.href} className="quick-service-content-card" onClick={() => setIsAnswerOpen(false)}><span>{card.kind === "article" ? "مقال" : card.kind === "booking" ? "حجز" : "خدمة"}</span><strong>{card.title}</strong><small>{card.description}</small><b>افتح الرابط <ArrowLeft size={15} aria-hidden="true" /></b></Link>)}</div></section>}
          {answer.navigation.length > 0 && <nav className="quick-service-navigation" aria-label="صفحات موقع الإشراقة"><h3>صفحات الموقع</h3><div>{answer.navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsAnswerOpen(false)}>{item.label}<ArrowLeft size={13} aria-hidden="true" /></Link>)}</div></nav>}
          <section className="quick-service-answer-rating" aria-labelledby="quick-service-answer-rating-title">
            <div><h3 id="quick-service-answer-rating-title">هل كانت هذه الإجابة مفيدة؟</h3><p>قيّمها بالنجوم لمساعدتنا على تحسين الإجابات القادمة.</p></div>
            <div className="quick-service-answer-stars" role="radiogroup" aria-label="تقييم إجابة المساعد">
              {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={selectedRating === rating} aria-label={`${rating} من 5 نجوم: ${ratingLabels[rating - 1]}`} title={ratingLabels[rating - 1]} className={selectedRating !== null && rating <= selectedRating ? "selected" : ""} onClick={() => rateAnswer(rating)} disabled={saveFeedback.isPending}><Star size={20} fill={selectedRating !== null && rating <= selectedRating ? "currentColor" : "none"} aria-hidden="true" /></button>)}
            </div>
            {feedbackSaved && <p className="quick-service-answer-rating-status" role="status"><Check size={15} aria-hidden="true" /> شكرًا، سُجّل تقييمك.</p>}
            {saveFeedback.error && <p className="quick-service-answer-rating-error" role="alert">تعذر حفظ التقييم الآن، يمكنك المحاولة مرة أخرى.</p>}
          </section>
          <Link href="/customer-service" className="quick-service-answer-more" onClick={() => setIsAnswerOpen(false)}>افتح خدمة العملاء للمزيد <ArrowLeft size={15} aria-hidden="true" /></Link>
        </div>}
      </DialogContent>
    </Dialog>
  </section>;
}
