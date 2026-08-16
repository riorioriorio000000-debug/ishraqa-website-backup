import { BellRing, Bot, Database, EyeOff, MessageCircle, ShieldCheck, Trash2 } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import SiteShell from "@/components/SiteShell";

const privacyItems = [
  {
    icon: Database,
    title: "بيانات تشغيلية محدودة",
    description: "ينشئ الموقع معرّف زائر عشوائيًا داخل متصفحك لحفظ تفاعلك مع التعليقات والإشعارات وعدّاد الزيارات. لا يحتوي هذا المعرّف على اسمك أو رقم هاتفك أو بريدك الإلكتروني.",
  },
  {
    icon: MessageCircle,
    title: "التعليقات اختيارية",
    description: "عند نشر تعليق أو رد، يُحفظ اسم العرض والنص والصورة الرمزية التي اخترتها فقط كي يظهر المحتوى للزوار ويتمكن النظام من حمايته من الإساءة.",
  },
  {
    icon: EyeOff,
    title: "لا تتبع إعلاني",
    description: "لا نطلب بريدًا إلكترونيًا أو رقم هاتف لإنشاء هوية الزائر، ولا نبيع بيانات الزوار أو نبني ملفًا إعلانيًا شخصيًا عنهم من خلال هذا الموقع.",
  },
  {
    icon: Bot,
    title: "المساعد الذكي",
    description: "عند استخدام المساعد، يُرسل نص محادثتك فقط للمعالجة من أجل الإجابة عن خدمات الإشراقة أو محتوى الموقع. لا تُرسل بيانات نموذج الحجز تلقائيًا إلى المحادثة.",
  },
];

export default function PrivacyPage() {
  return <SiteShell>
    <PageMeta
      title="سياسة الخصوصية"
      description="سياسة خصوصية موقع شركة الإشراقة: شرح واضح للبيانات المحدودة التي يعالجها الموقع، واستخدام المساعد، وخيارات التحكم المتاحة للزائر."
      keywords={["سياسة الخصوصية", "خصوصية الزوار", "الإشراقة", "تفضيلات الإشعارات"]}
      path="/privacy"
    />
    <main className="inner-page privacy-page" dir="rtl">
      <section className="inner-hero privacy-hero">
        <div className="shell">
          <span className="eyebrow"><i /> خصوصيتك باختصار</span>
          <h1>سياسة الخصوصية</h1>
          <p>نوضح هنا، بلغة مباشرة، ما الذي يحتاجه الموقع للعمل وما الذي لا نجمعه عنك. آخر تحديث: أغسطس 2026.</p>
        </div>
      </section>
      <section className="section privacy-content">
        <div className="shell privacy-layout">
          <div className="privacy-lead">
            <ShieldCheck size={30} aria-hidden="true" />
            <div>
              <h2>الحد الأدنى اللازم لتجربة مفيدة</h2>
              <p>نعالج أقل قدر ممكن من البيانات لتقديم التعليقات، التفاعلات، الإشعارات، والمساعدة داخل الموقع. يمكنك الاستمرار في تصفح الصفحات دون إنشاء حساب.</p>
            </div>
          </div>
          <div className="privacy-grid">
            {privacyItems.map(({ icon: Icon, title, description }) => <article className="privacy-card" key={title}>
              <Icon size={22} aria-hidden="true" />
              <h2>{title}</h2>
              <p>{description}</p>
            </article>)}
          </div>
          <article className="privacy-rights">
            <div><BellRing size={22} aria-hidden="true" /><h2>خياراتك وحقوقك</h2></div>
            <p>يمكنك إيقاف تنبيهات التفاعل (مثل القلوب) من <a href="/notification-preferences">تفضيلات الإشعارات</a> مع إبقاء تنبيهات الردود. كما يمكنك حذف تعليقك المنشور من خيارات التعليق. ولطلب مساعدة إضافية بشأن محتوى نشرته، تواصل معنا عبر <a href="https://wa.me/966552610151" target="_blank" rel="noreferrer">واتساب الإشراقة</a>.</p>
          </article>
          <article className="privacy-rights privacy-retention">
            <div><Trash2 size={22} aria-hidden="true" /><h2>مدة الاحتفاظ والمراجعة</h2></div>
            <p>نحتفظ بالتعليقات والتفاعلات والإشعارات اللازمة لتشغيلها أو التعامل مع إساءة الاستخدام. وقد نراجع بلاغات المحتوى آليًا بالنطاق الموضح عند إرسال البلاغ؛ لا يُتخذ إجراء تقييدي إلا عند تأكيد مخالفة فعلية.</p>
          </article>
        </div>
      </section>
    </main>
  </SiteShell>;
}
