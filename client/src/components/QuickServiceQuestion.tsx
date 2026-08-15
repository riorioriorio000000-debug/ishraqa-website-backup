import { FormEvent, useState } from "react";
import { ArrowLeft, LoaderCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type QuestionAnswer = { reply: string; workSummary?: string };

export default function QuickServiceQuestion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuestionAnswer | null>(null);
  const ask = trpc.ai.chat.useMutation({
    onSuccess: (data) => setAnswer({ reply: data.reply, workSummary: data.workSummary?.join(" • ") }),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = question.trim();
    if (!content || ask.isPending) return;
    setAnswer(null);
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
      {answer && <article className="quick-service-question-answer" aria-live="polite"><span>إجابة المساعد</span><p>{answer.reply}</p><Link href="/customer-service">افتح خدمة العملاء للمزيد <ArrowLeft size={15} /></Link></article>}
    </div>
  </section>;
}
