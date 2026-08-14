import { AIChatBox, type Message } from "@/components/AIChatBox";
import SiteShell from "@/components/SiteShell";
import { browseFailureMessage } from "@/lib/chatMessages";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, CalendarCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Link } from "wouter";

const prompts = [
  "ما الخدمة الأنسب لتنظيف شقة؟",
  "هل تصلون إلى مدينتي؟",
  "كيف أرتب طلب نقل العفش؟",
  "لخّص لي مقالة تنظيف الرياض",
];

type ChatMessage = { role: "user" | "assistant"; content: string };
const publicUrlPattern = /https?:\/\/[^\s<>"'`\])}]+/i;

function extractPublicUrl(content: string) {
  const match = content.match(publicUrlPattern);
  return match?.[0]?.replace(/[.,،؛!?]+$/, "") || null;
}

export default function CustomerService() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRequest, setActiveRequest] = useState<"chat" | "browse" | null>(null);
  const chat = trpc.ai.chat.useMutation({
    onSuccess: ({ reply }) => {
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
      setActiveRequest(null);
    },
    onError: () => setActiveRequest(null),
  });
  const browse = trpc.ai.browseAndSummarize.useMutation({
    onSuccess: ({ summary, title, sourceUrl }) => {
      setMessages((current) => [...current, { role: "assistant", content: `### ملخص صفحة عامة: ${title}\n\n${summary}\n\n[فتح المصدر](${sourceUrl})` }]);
      setActiveRequest(null);
    },
    onError: (error) => {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: browseFailureMessage(error.message),
        },
      ]);
      setActiveRequest(null);
    },
  });

  function sendMessage(content: string) {
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    const url = extractPublicUrl(content);
    if (url) {
      const question = content.replace(url, "").replace(/^\s*(?:لخ[ّصص]|اختصر|اقرأ)\s*(?:هذه\s*)?(?:الصفحة)?\s*[:：-]?\s*/i, "").trim();
      setActiveRequest("browse");
      browse.mutate({ url, question: question || undefined });
      return;
    }
    setActiveRequest("chat");
    chat.mutate({ messages: next });
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
                isLoading={activeRequest !== null}
                height="610px"
                placeholder="اسأل عن الخدمات أو ألصق رابط صفحة عامة لتلخيصها…"
                emptyStateMessage="اسأل عن الخدمة، المدن، التحضير للحجز أو المقالات. يمكنك أيضًا لصق رابط صفحة عامة لتلخيصه هنا."
                suggestedPrompts={prompts}
                quickActions={[
                  { label: "ابحث داخل الموقع", prompt: "ابحث في الموقع عن " },
                  { label: "لخّص صفحة ويب", prompt: "لخّص هذه الصفحة: " },
                ]}
                className="assistant-chatbox"
              />
              <p className="assistant-privacy-note"><ShieldCheck size={17} /> <strong>خصوصيتك مهمة:</strong> يُرسل نص السؤال الذي تكتبه فقط لمعالجة الرد. عند لصق رابط عام، تُقرأ الصفحة المتاحة فقط لتلخيصها. لا يُرسل نموذج الحجز أو رقم هاتفك تلقائيًا؛ لذا تجنّب إدخال أي بيانات حساسة في المحادثة.</p>
              {chat.error && <p className="assistant-error">تعذر الرد الآن. يمكنك التواصل عبر واتساب مباشرة.</p>}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
