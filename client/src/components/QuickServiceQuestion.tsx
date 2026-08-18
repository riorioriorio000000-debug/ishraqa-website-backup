import React, { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Sparkles, Star, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Service = "cleaning" | "maintenance" | "moving" | "general";
type ContentCard = { id: string; kind: string; title: string; description: string; href: string };
type QuestionAnswer = { reply: string; workSummary?: string; navigation: readonly { label: string; href: string }[]; contentCards: ContentCard[]; recommendationContext: { service: Service; city?: string } };

const ratingLabels = ["غير مفيدة", "تحتاج تحسينًا", "مقبولة", "مفيدة", "مفيدة جدًا"];
const serviceLabels: Record<Service, string> = { cleaning: "التنظيف", maintenance: "الصيانة", moving: "نقل العفش", general: "خدمات عامة" };
const citySuggestions = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "أبها", "تبوك", "القصيم"];

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
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [manualService, setManualService] = useState<Service>("general");
  const [manualCity, setManualCity] = useState("");
  const saveFeedback = trpc.feedback.submitAssistantAnswer.useMutation({ onSuccess: () => setFeedbackSaved(true) });
  const ask = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const nextAnswer: QuestionAnswer = { reply: data.reply, workSummary: data.workSummary?.join(" • "), navigation: data.navigation, contentCards: data.contentCards, recommendationContext: data.recommendationContext };
      setAnswer(nextAnswer);
      setManualService(nextAnswer.recommendationContext.service);
      setManualCity(nextAnswer.recommendationContext.city || "");
      setFeedbackId(createFeedbackId());
      setSelectedRating(null);
      setFeedbackNote("");
      setFeedbackSaved(false);
      setIsAnswerOpen(true);
    },
  });
  const { data: summary } = trpc.feedback.assistantAnswerSummary.useQuery(undefined, { enabled: isAnswerOpen });
  const { data: filteredCards } = trpc.ai.recommendContent.useQuery({ service: manualService, city: manualCity.trim() || undefined }, { enabled: isAnswerOpen });
  const displayedCards = useMemo(() => filteredCards || answer?.contentCards || [], [filteredCards, answer]);

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
  }

  function saveRating() {
    if (!answer || !feedbackId || !selectedRating || saveFeedback.isPending) return;
    saveFeedback.mutate({ id: feedbackId, rating: selectedRating, service: manualService, city: manualCity.trim() || undefined, contentCardIds: displayedCards.map((card) => card.id).slice(0, 3), note: feedbackNote.trim() || undefined });
  }

  return <section className="quick-service-question" aria-labelledby="quick-service-question-title">
    <div className="quick-service-question-copy"><span className="eyebrow"><Sparkles size={15} /> اسأل المساعد</span><h2 id="quick-service-question-title">لم تجد إجابتك؟<br /><em>اكتب سؤالك بطريقتك.</em></h2><p>يشرح لك مساعد الإشراقة الخطوة المناسبة اعتمادًا على معلومات الموقع، ثم يمكنك متابعة التفاصيل مع فريق الخدمة.</p></div>
    <div className="quick-service-question-panel"><form onSubmit={submit}><label htmlFor="quick-service-question-input">اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش</label><textarea id="quick-service-question-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="مثال: ما المعلومات التي أحتاجها قبل طلب تنظيف شقة؟" rows={3} maxLength={800} disabled={ask.isPending} /><button className="button" type="submit" disabled={!question.trim() || ask.isPending}>{ask.isPending ? <><LoaderCircle size={17} className="spin" /> يجهّز الإجابة…</> : <>اسأل الآن <ArrowLeft size={16} /></>}</button></form>{ask.error && <p className="quick-service-question-error" role="alert">تعذر تجهيز الإجابة الآن. يمكنك المحاولة مرة أخرى أو التواصل عبر واتساب.</p>}</div>
    <Dialog open={isAnswerOpen} onOpenChange={setIsAnswerOpen}><DialogContent className="quick-service-answer-dialog" showCloseButton={false} dir="rtl" aria-describedby="quick-service-answer-description"><DialogClose className="quick-service-answer-close" aria-label="إغلاق إجابة المساعد"><X size={18} aria-hidden="true" /></DialogClose><DialogHeader><span className="quick-service-answer-kicker"><Sparkles size={15} aria-hidden="true" /> إجابة المساعد</span><DialogTitle>إجابة مرتبطة بموقع الإشراقة</DialogTitle><DialogDescription id="quick-service-answer-description">تظهر الإجابة العملية أولًا، ثم يمكنك الانتقال إلى الصفحات المقترحة عند الحاجة.</DialogDescription></DialogHeader>{answer && <div className="quick-service-answer-body" aria-live="polite"><p className="quick-service-answer-reply whitespace-pre-line">{answer.reply}</p>{answer.workSummary && <p className="quick-service-answer-summary">{answer.workSummary}</p>}
      <section className="quick-service-recommendation-filters" aria-labelledby="quick-service-recommendation-filters-title"><h3 id="quick-service-recommendation-filters-title">خصّص المقالات المقترحة</h3><div><label>نوع الخدمة<select value={manualService} onChange={(event) => setManualService(event.target.value as Service)}>{(Object.keys(serviceLabels) as Service[]).map((service) => <option key={service} value={service}>{serviceLabels[service]}</option>)}</select></label><label>المدينة أو الحي<input value={manualCity} onChange={(event) => setManualCity(event.target.value)} list="faq-city-suggestions" placeholder="مثال: الرياض" /><datalist id="faq-city-suggestions">{citySuggestions.map((city) => <option key={city} value={city} />)}</datalist></label></div></section>
      {displayedCards.length > 0 && <section aria-labelledby="quick-service-content-links"><h3 id="quick-service-content-links">محتوى مقترح</h3><div className="quick-service-content-cards">{displayedCards.map((card) => <Link key={card.id} href={card.href} className="quick-service-content-card" onClick={() => setIsAnswerOpen(false)}><span>{card.kind === "article" ? "مقال" : card.kind === "booking" ? "حجز" : "خدمة"}</span><strong>{card.title}</strong><small>{card.description}</small><b>افتح الرابط <ArrowLeft size={15} aria-hidden="true" /></b></Link>)}</div></section>}
      {answer.navigation.length > 0 && <nav className="quick-service-navigation" aria-label="صفحات موقع الإشراقة"><h3>صفحات الموقع</h3><div>{answer.navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsAnswerOpen(false)}>{item.label}<ArrowLeft size={13} aria-hidden="true" /></Link>)}</div></nav>}
      <section className="quick-service-answer-rating" aria-labelledby="quick-service-answer-rating-title"><div><h3 id="quick-service-answer-rating-title">هل كانت هذه الإجابة مفيدة؟</h3><p>قيّمها بالنجوم، ثم أضف ملاحظة اختيارية إن أردت.</p></div><div className="quick-service-answer-stars" role="radiogroup" aria-label="تقييم إجابة المساعد">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={selectedRating === rating} aria-label={`${rating} من 5 نجوم: ${ratingLabels[rating - 1]}`} title={ratingLabels[rating - 1]} className={selectedRating !== null && rating <= selectedRating ? "selected" : ""} onClick={() => rateAnswer(rating)} disabled={saveFeedback.isPending}><Star size={20} fill={selectedRating !== null && rating <= selectedRating ? "currentColor" : "none"} aria-hidden="true" /></button>)}</div>
        {selectedRating && <div className="quick-service-answer-note"><label htmlFor="assistant-feedback-note">ملاحظة إضافية <span>اختيارية</span></label><textarea id="assistant-feedback-note" value={feedbackNote} onChange={(event) => { setFeedbackNote(event.target.value); setFeedbackSaved(false); }} placeholder="ما الذي يمكن تحسينه في الإجابة؟" maxLength={600} rows={3} /><button type="button" className="button button-small" onClick={saveRating} disabled={saveFeedback.isPending}>{saveFeedback.isPending ? "جارٍ الحفظ…" : "إرسال التقييم"}</button></div>}
        {feedbackSaved && <p className="quick-service-answer-rating-status" role="status"><Check size={15} aria-hidden="true" /> شكرًا، سُجّل تقييمك{feedbackNote.trim() ? " وملاحظتك" : ""}.</p>}{saveFeedback.error && <p className="quick-service-answer-rating-error" role="alert">تعذر حفظ التقييم الآن، يمكنك المحاولة مرة أخرى.</p>}<details className="quick-service-answer-rating-summary"><summary>عرض ملخص ملاحظات التقييمات</summary><p>{summary?.count ? `متوسط التقييم ${summary.average} من 5 بناءً على ${summary.count} تقييم${summary.noteCount ? `، مع ${summary.noteCount} ملاحظة إضافية` : ""}.` : "لا توجد تقييمات مسجلة بعد."}</p></details></section>
      <Link href="/customer-service" className="quick-service-answer-more" onClick={() => setIsAnswerOpen(false)}>افتح خدمة العملاء للمزيد <ArrowLeft size={15} aria-hidden="true" /></Link></div>}</DialogContent></Dialog>
  </section>;
}
