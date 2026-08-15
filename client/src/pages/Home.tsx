import { ArrowLeft, Check, Home as HomeIcon, MessageCircle, ShieldCheck, Sparkles, Truck, Wrench } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";

const services = [
  { icon: HomeIcon, number: "01", title: "تنظيف المنازل", text: "تنظيف عميق ومنظم للشقق والمنازل والمساحات التي تحتاج إلى عناية دقيقة." },
  { icon: Wrench, number: "02", title: "الصيانة المنزلية", text: "تنسيق واضح لخدمات الصيانة الأساسية والتفاصيل التي لا تحتمل التأجيل." },
  { icon: Truck, number: "03", title: "نقل العفش", text: "ترتيب ونقل الأثاث بعناية وبخطة تناسب المكان والموعد الذي تقترحه." },
];

const guides = [
  { href: "/articles/riyadh-service-guide", place: "الرياض", title: "تنظيف المنزل في الرياض: من أين تبدأ؟", text: "دليل قصير لترتيب الأولويات قبل طلب الخدمة." },
  { href: "/articles/jeddah-service-guide", place: "جدة", title: "كيف تحافظ على خفة المكان بعد التنظيف؟", text: "عادات عملية تساعد على بقاء أثر العناية." },
  { href: "/articles/makkah-service-guide", place: "مكة", title: "اختيار خدمة مناسبة للمساحة", text: "أسئلة بسيطة تجعل تنسيق الموعد أوضح." },
];

function QuickRequest() {
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [details, setDetails] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const message = encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن خدمة من الإشراقة.\nالمدينة أو الحي: ${city.trim() || "لم يحدد"}\nالخدمة المطلوبة: ${service.trim() || "لم تحدد"}\nتفاصيل إضافية: ${details.trim() || "لا توجد"}`);
    window.open(`https://wa.me/966552610151?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return <section className="classic-request" id="request"><div className="shell-inner classic-request-grid">
    <div><span className="eyebrow">رسالة قصيرة تكفي</span><h2>اكتب احتياجك،<br /><em>ونرتّب الخطوة التالية.</em></h2><p>لا قوائم مفروضة ولا حقول اختيار. اكتب المدينة أو الحي والخدمة التي تحتاجها بالطريقة التي تناسبك.</p></div>
    <form onSubmit={submit} className="classic-request-form">
      <label>المدينة أو الحي<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="مثال: حي النزهة، جدة" /></label>
      <label>الخدمة المطلوبة<input value={service} onChange={(event) => setService(event.target.value)} placeholder="مثال: تنظيف شقة بعد انتقال" /></label>
      <label>تفاصيل تساعدنا<textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="المساحة، الوقت المناسب، أو أي تفاصيل تهمك" maxLength={700} /></label>
      <button className="button" type="submit">إرسال عبر واتساب <MessageCircle size={17} /></button>
    </form>
  </div></section>;
}

export default function Home() {
  return <SiteShell><main className="classic-home" dir="rtl">
      <section className="classic-hero" id="top"><div className="shell-inner classic-hero-grid">
        <div className="classic-hero-copy"><span className="eyebrow"><Sparkles size={15} /> عناية تُرى، وراحة تُحس</span><h1>بيتك أنظف.<br /><em>يومك أخف.</em></h1><p>نساعدك على ترتيب احتياج المنزل بهدوء، من تنظيف المكان وصيانته إلى نقل العفش، مع تواصل مباشر وخطوات مفهومة.</p><div className="classic-hero-actions"><a href="#request" className="button">اكتب طلبك <ArrowLeft size={17} /></a><Link href="/services" className="text-link">تعرف إلى خدماتنا <ArrowLeft size={16} /></Link></div><div className="classic-hero-notes"><span><b>3</b> مسارات خدمة</span><span><b>12+</b> مدينة ومنطقة</span><span><b>واتساب</b> للتنسيق</span></div></div>
        <div className="classic-hero-art" aria-label="تفاصيل خدمة الإشراقة"><div className="classic-orbit" /><div className="classic-art-card classic-art-card-main"><Sparkles size={25} /><strong>ترتيب هادئ<br />للتفاصيل اليومية</strong></div><div className="classic-art-card classic-art-card-small"><Check size={18} /><span>خطوة واضحة<br />من أول رسالة</span></div><span className="classic-art-label">الإشراقة<br /><i>للعناية المنزلية</i></span></div>
      </div></section>

      <section className="classic-services"><div className="shell-inner"><div className="classic-section-heading"><div><span className="eyebrow">خدماتنا</span><h2>نرتّب التفاصيل بهدوء،<br /><em>لتعود إلى يومك بخفة.</em></h2></div><p>خدمات عملية للمكان الذي تعيش فيه، مع مساحة كافية لشرح ما تحتاجه بطريقتك.</p></div><div className="classic-service-grid">{services.map(({ icon: Icon, number, title, text }) => <article className="classic-service-card" key={title}><span>{number}</span><Icon size={30} /><h3>{title}</h3><p>{text}</p><Link href="/services" className="card-link">استكشف التفاصيل <ArrowLeft size={15} /></Link></article>)}</div></div></section>

      <section className="classic-split"><div className="shell-inner classic-split-grid"><div className="classic-house-mark"><span /><span /><div><ShieldCheck size={44} /><b>وضوح<br />من البداية</b></div></div><div><span className="eyebrow">كيف نعمل؟</span><h2>الخدمة تبدأ<br /><em>برسالة واضحة.</em></h2><p>اكتب ما يهمك عن المكان والوقت، ثم نرتب معك المسار المناسب. نفضل الوضوح على الوعود الكبيرة والخطوات المعقدة.</p><div className="classic-check-list"><span><Check size={17} /> تحديد الأولوية قبل الوصول</span><span><Check size={17} /> تجهيز يناسب نوع الخدمة</span><span><Check size={17} /> تواصل مباشر لتأكيد التفاصيل</span></div><Link href="/about" className="text-link">اعرف أكثر عن طريقتنا <ArrowLeft size={16} /></Link></div></div></section>

      <QuickRequest />

      <section className="classic-guides"><div className="shell-inner"><div className="classic-section-heading"><div><span className="eyebrow">من دليل العناية</span><h2>ملاحظات صغيرة<br /><em>تجعل المكان ألطف.</em></h2></div><Link href="/articles" className="text-link">كل المقالات <ArrowLeft size={16} /></Link></div><div className="classic-guide-grid">{guides.map((guide, index) => <Link href={guide.href} className="classic-guide-card" key={guide.href}><span>0{index + 1} / {guide.place}</span><h3>{guide.title}</h3><p>{guide.text}</p><b>قراءة الدليل <ArrowLeft size={15} /></b></Link>)}</div></div></section>

      <section className="classic-final"><div className="shell-inner"><div><span className="eyebrow">نقاء يومك</span><h2>جاهز ترتّب<br />الخطوة الأولى؟</h2></div><a href="#request" className="button button-light">ابدأ برسالة <ArrowLeft size={17} /></a></div></section>
    </main>
  </SiteShell>;
}
