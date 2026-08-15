import { ArrowLeft, Calculator, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import SiteShell from "@/components/SiteShell";
import PageMeta from "@/components/PageMeta";

export default function ServiceCalculator() {
  const [service, setService] = useState("");
  const [property, setProperty] = useState("");
  const [size, setSize] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const selectedService = service.trim() || "الخدمة التي تحتاجها";
  const selectedProperty = property.trim() || "المكان الذي تريد خدمته";
  const selectedSize = size.trim() || "لم تذكر المساحة بعد";
  const whatsappUrl = `https://wa.me/966552610151?text=${encodeURIComponent(`السلام عليكم، أريد تنسيق خدمة مع شركة الإشراقة.\nالخدمة: ${service.trim() || "لم تحدد"}\nالمكان: ${property.trim() || "لم تحدد"}\nالمساحة أو الحجم: ${size.trim() || "لم تحدد"}\nالمدينة أو الحي: ${city.trim() || "لم تحدد"}\nالتفاصيل: ${details.trim() || "لا توجد"}`)}`;

  return (
    <SiteShell>
      <PageMeta title="حاسبة ترتيب طلب الخدمة" description="رتّب تفاصيل طلب التنظيف أو الصيانة أو نقل العفش قبل التواصل، دون إظهار أسعار ثابتة أو التزام بحجز." keywords={["حاسبة تنظيف", "تنظيم طلب صيانة", "طلب نقل عفش", "واتساب الإشراقة"]} path="/calculator" />
      <main className="calculator-page" dir="rtl">
        <section className="calculator-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(11,64,70,.94), rgba(11,64,70,.78)), url('/manus-storage/ishraqa-calculator-background_0832e013.webp')" }}>
          <div className="shell calculator-hero-inner">
            <span className="eyebrow eyebrow-light"><i /> حاسبة الخدمة</span>
            <h1>رتّب احتياجك قبل التواصل.</h1>
            <p>اكتب تفاصيل احتياجك بطريقتك لنجهّز رسالة واضحة للفريق. لا نعرض أسعارًا تقديرية؛ السعر والموعد يؤكدان مباشرة بعد مراجعة تفاصيل المكان.</p>
          </div>
        </section>

        <section className="section calculator-section">
          <div className="shell calculator-grid">
            <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
              <div className="calculator-heading"><Calculator size={24} /><div><span>الخطوة 01</span><h2>اكتب نوع الطلب</h2></div></div>
              <label className="calculator-select">نوع الخدمة<input value={service} onChange={(event) => setService(event.target.value)} placeholder="مثال: تنظيف مجلس أو تعقيم شقة" /></label>

              <div className="calculator-heading"><Sparkles size={24} /><div><span>الخطوة 02</span><h2>صف المكان باختصار</h2></div></div>
              <label className="calculator-select">نوع المكان<input value={property} onChange={(event) => setProperty(event.target.value)} placeholder="مثال: استراحة صغيرة أو مكتب" /></label>
              <label className="calculator-select">الحجم أو المساحة<input value={size} onChange={(event) => setSize(event.target.value)} placeholder="مثال: 180 مترًا أو خمس غرف" /></label>
              <label className="calculator-select">المدينة<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="مثال: الرياض" /></label>
              <label className="calculator-select">اكتب تفاصيلك بنفسك <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={700} placeholder="مثال: لدي موعد مفضل، أو غرفة محددة، أو نوع عطل، أو تفاصيل لا توجد ضمن الخيارات." /></label>
            </form>

            <aside className="calculator-result" aria-live="polite">
              <span className="eyebrow"><i /> ملخص احتياجك</span>
              <h2>{selectedService} لـ {selectedProperty}</h2>
              <div className="result-line"><CheckCircle2 size={19} /><p><strong>حجم المساحة:</strong> {selectedSize}</p></div>
              <div className="result-line"><CheckCircle2 size={19} /><p><strong>المدينة أو الحي:</strong> {city.trim() || "لم تحدد المدينة بعد"}</p></div>
              <div className="result-line"><CheckCircle2 size={19} /><p><strong>طريقة التنسيق:</strong> اكتب أي تفاصيل إضافية في الرسالة وسيتابع الفريق معك مباشرة.</p></div>
              {details.trim() && <div className="result-line"><CheckCircle2 size={19} /><p><strong>تفاصيلك:</strong> {details.trim()}</p></div>}
              <p className="calculator-disclaimer">النتيجة تساعد في تنظيم الطلب فقط. يراجع الفريق التفاصيل ويؤكد المدة والتكلفة قبل أي تنفيذ.</p>
              <a className="button calculator-cta" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> أرسل الملخص عبر واتساب <ArrowLeft size={17} /></a>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
