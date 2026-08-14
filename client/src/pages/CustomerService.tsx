import { AIChatBox, type Message } from "@/components/AIChatBox";
import SiteShell from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, CalendarCheck, Globe2, Loader2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";

const prompts = [
  "ما الخدمة الأنسب لتنظيف شقة؟",
  "هل تصلون إلى مدينتي؟",
  "كيف أرتب طلب نقل العفش؟",
  "لخّص لي مقالة تنظيف الرياض",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function CustomerService() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [webSummary, setWebSummary] = useState<{ title: string; summary: string; sourceUrl: string } | null>(null);
  const chat = trpc.ai.chat.useMutation({
    onSuccess: ({ reply }) => setMessages((current) => [...current, { role: "assistant" as const, content: reply }]),
  });
  const browse = trpc.ai.browseAndSummarize.useMutation({
    onSuccess: (result) => setWebSummary(result),
  });

  function sendMessage(content: string) {
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    chat.mutate({ messages: next });
  }

  function submitBrowse(event: FormEvent) {
    event.preventDefault();
    if (!url.trim() || browse.isPending) return;
    setWebSummary(null);
    browse.mutate({ url: url.trim(), question: question.trim() || undefined });
  }

  return (
    <SiteShell>
      <main className="assistant-page" dir="rtl">
        <section className="assistant-hero">
          <div className="shell assistant-hero-grid">
            <div className="assistant-hero-copy">
              <span className="eyebrow"><i /> خدمة العملاء الذكية</span>
              <h1>اسأل بوضوح،<br />وخُذ <em>الخطوة المناسبة.</em></h1>
              <p>مساعد عربي يفهم خدمات الإشراقة ومقالاتها، ويعطيك جوابًا مختصرًا ثم يوصلك إلى الصفحة المناسبة. لا يحجز ولا يطلب معلومات حساسة.</p>
              <div className="assistant-trust"><span><ShieldCheck size={16} /> معلومات الموقع أولًا</span><span><Sparkles size={16} /> شرح مختصر وواضح</span></div>
              <nav className="assistant-route-links" aria-label="روابط وصول سريعة"><Link href="/services"><Sparkles size={15} /> الخدمات <ArrowLeft size={14} /></Link><Link href="/articles"><BookOpen size={15} /> المقالات <ArrowLeft size={14} /></Link><Link href="/where-we-work"><MapPin size={15} /> أين نعمل <ArrowLeft size={14} /></Link><Link href="/booking"><CalendarCheck size={15} /> الحجز <ArrowLeft size={14} /></Link></nav>
            </div>
            <aside className="assistant-hero-note"><span>مساعد الإشراقة</span><strong>ابدأ برسالة واحدة.</strong><p>اسأل عن الخدمة، المدينة، التحضير للحجز أو إحدى المقالات. إذا احتجت تفصيلًا خاصًا، اكتبه بطريقتك.</p><small>لا توجد إجابة آلية تُلزمك بأي حجز أو خطوة.</small></aside>
          </div>
        </section>

        <section className="section assistant-workspace">
          <div className="shell assistant-workspace-grid">
            <div className="assistant-chat-panel">
              <div className="assistant-panel-heading"><div><span>الإشراقة AI</span><h2>كيف أساعدك اليوم؟</h2></div><Sparkles size={23} /></div>
              <AIChatBox
                messages={messages}
                onSendMessage={sendMessage}
                isLoading={chat.isPending}
                height="610px"
                placeholder="اكتب سؤالك عن الخدمات أو المقالات…"
                emptyStateMessage="اسأل عن الخدمة، المدن، التحضير للحجز أو المقالات."
                suggestedPrompts={prompts}
                className="assistant-chatbox"
              />
              <p className="assistant-privacy-note"><ShieldCheck size={17} /> <strong>خصوصيتك مهمة:</strong> يُرسل نص السؤال الذي تكتبه فقط لمعالجة الرد. لا يُرسل نموذج الحجز أو رقم هاتفك تلقائيًا إلى المساعد، لذا تجنّب إدخال أي بيانات حساسة في المحادثة.</p>
              {chat.error && <p className="assistant-error">تعذر الرد الآن. يمكنك التواصل عبر واتساب مباشرة.</p>}
            </div>

            <aside className="assistant-side-panel">
              <div className="assistant-side-icon"><Globe2 size={24} /></div>
              <span className="eyebrow">تلخيص صفحة عامة</span>
              <h2>اقرأ صفحة ثم لخّصها.</h2>
              <p>ألصق رابط صفحة عامة، وسيقرأ المساعد النص المتاح فيها ويلخصه لك. لا يمكنه فتح حسابات أو صفحات خاصة أو تنفيذ إجراءات نيابةً عنك. أرسل روابط لا تحتوي على بيانات خاصة.</p>
              <form className="assistant-browse-form" onSubmit={submitBrowse}>
                <label htmlFor="public-url">رابط الصفحة العامة</label>
                <input id="public-url" type="url" dir="ltr" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/article" required />
                <label htmlFor="browse-question">ماذا تريد أن تعرف؟ <small>اختياري</small></label>
                <textarea id="browse-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="لخّص أهم النقاط" maxLength={800} />
                <button className="button" type="submit" disabled={browse.isPending}>{browse.isPending ? <><Loader2 size={16} className="spin" /> جارٍ القراءة…</> : <><Globe2 size={16} /> لخّص الصفحة</>}</button>
              </form>
              {browse.error && <p className="assistant-error">تعذر قراءة الصفحة. تأكد أن الرابط عام ويشير إلى صفحة HTML.</p>}
              {webSummary && <article className="web-summary"><span>ملخص عام</span><h3>{webSummary.title}</h3><div><Streamdown>{webSummary.summary}</Streamdown></div><a href={webSummary.sourceUrl} target="_blank" rel="noreferrer">فتح المصدر</a></article>}
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
