import { ArrowLeft, Calculator, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import SiteShell from "@/components/SiteShell";
import PageMeta from "@/components/PageMeta";
import { calculateServicePlan, propertyLabels, serviceLabels, sizeLabels, type PropertyKey, type ServiceKey, type SizeKey } from "@shared/serviceCalculator";

export default function ServiceCalculator() {
  const [service, setService] = useState<ServiceKey>("cleaning");
  const [property, setProperty] = useState<PropertyKey>("apartment");
  const [size, setSize] = useState<SizeKey>("medium");
  const [city, setCity] = useState("الرياض");
  const [details, setDetails] = useState("");
  const plan = useMemo(() => calculateServicePlan({ service, property, size, city, details }), [service, property, size, city, details]);
  const whatsappUrl = `https://wa.me/966509614797?text=${encodeURIComponent(plan.message)}`;

  return (
    <SiteShell>
      <PageMeta title="حاسبة ترتيب طلب الخدمة" description="رتّب تفاصيل طلب التنظيف أو الصيانة أو نقل العفش قبل التواصل، دون إظهار أسعار ثابتة أو التزام بحجز." keywords={["حاسبة تنظيف", "تنظيم طلب صيانة", "طلب نقل عفش", "واتساب الإشراقة"]} path="/calculator" />
      <main className="calculator-page" dir="rtl">
        <section className="calculator-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(11,64,70,.94), rgba(11,64,70,.78)), url('/manus-storage/ishraqa-calculator-background_0832e013.webp')" }}>
          <div className="shell calculator-hero-inner">
            <span className="eyebrow eyebrow-light"><i /> حاسبة الخدمة</span>
            <h1>رتّب احتياجك قبل التواصل.</h1>
            <p>أجب عن خطوات بسيطة لنجهّز رسالة واضحة للفريق. هذه الحاسبة لا تعرض أسعارًا تقديرية؛ السعر والموعد يؤكدان مباشرة بعد مراجعة تفاصيل المكان.</p>
          </div>
        </section>

        <section className="section calculator-section">
          <div className="shell calculator-grid">
            <form className="calculator-form" onSubmit={(event) => event.preventDefault()}>
              <div className="calculator-heading"><Calculator size={24} /><div><span>الخطوة 01</span><h2>اختر نوع الطلب</h2></div></div>
              <div className="choice-grid three">
                {(Object.keys(serviceLabels) as ServiceKey[]).map((key) => <button type="button" key={key} aria-pressed={service === key} className={service === key ? "choice active" : "choice"} onClick={() => setService(key)}><strong>{serviceLabels[key]}</strong><small>{key === "cleaning" ? "عناية دورية أو عميقة" : key === "maintenance" ? "ترتيب أعمال المنزل" : "تغليف ونقل منظم"}</small></button>)}
              </div>

              <div className="calculator-heading"><Sparkles size={24} /><div><span>الخطوة 02</span><h2>صف المكان باختصار</h2></div></div>
              <div className="choice-grid">
                {(Object.keys(propertyLabels) as PropertyKey[]).map((key) => <button type="button" key={key} aria-pressed={property === key} className={property === key ? "choice active" : "choice"} onClick={() => setProperty(key)}>{propertyLabels[key]}</button>)}
              </div>
              <label className="calculator-select">حجم المكان<select value={size} onChange={(event) => setSize(event.target.value as SizeKey)}>{(Object.keys(sizeLabels) as SizeKey[]).map((key) => <option value={key} key={key}>{sizeLabels[key]}</option>)}</select></label>
              <label className="calculator-select">المدينة<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="مثال: الرياض" /></label>
              <label className="calculator-select">اكتب تفاصيلك بنفسك <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={700} placeholder="مثال: لدي موعد مفضل، أو غرفة محددة، أو نوع عطل، أو تفاصيل لا توجد ضمن الخيارات." /></label>
            </form>

            <aside className="calculator-result" aria-live="polite">
              <span className="eyebrow"><i /> ملخص احتياجك</span>
              <h2>{serviceLabels[service]} لـ {propertyLabels[property]}</h2>
              <div className="result-line"><CheckCircle2 size={19} /><p><strong>حجم المساحة:</strong> {sizeLabels[size]}</p></div>
              <div className="result-line"><CheckCircle2 size={19} /><p><strong>طريقة التنسيق:</strong> {plan.visitLevel}</p></div>
              <div className="result-line"><CheckCircle2 size={19} /><p><strong>ما نحتاج معرفته:</strong> {plan.focus}</p></div>
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
