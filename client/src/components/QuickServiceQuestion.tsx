import React, { FormEvent, useState } from "react";
import { ArrowLeft, LoaderCircle, Sparkles, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type QuestionAnswer = {
  reply: string;
  workSummary?: string;
  navigation: readonly { label: string; href: string }[];
  contentCards: { id: string; kind: string; title: string; description: string; href: string }[];
};

export default function QuickServiceQuestion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const ask = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setAnswer({
        reply: data.reply,
        workSummary: data.workSummary?.join(" • "),
        navigation: data.navigation,
        contentCards: data.contentCards,
      });
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
          <Link href="/customer-service" className="quick-service-answer-more" onClick={() => setIsAnswerOpen(false)}>افتح خدمة العملاء للمزيد <ArrowLeft size={15} aria-hidden="true" /></Link>
        </div>}
      </DialogContent>
    </Dialog>
  </section>;
}
