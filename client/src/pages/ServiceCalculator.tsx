import { ArrowLeft, Calculator, CheckCircle2, ImagePlus, LoaderCircle, MessageCircle, Sparkles, X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import SiteShell from "@/components/SiteShell";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";

type EstimateAttachment = {
  name: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  dataUrl: string;
};

export default function ServiceCalculator() {
  const [service, setService] = useState("");
  const [property, setProperty] = useState("");
  const [size, setSize] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const [attachment, setAttachment] = useState<EstimateAttachment | null>(null);
  const [uploadError, setUploadError] = useState("");
  const estimate = trpc.ai.serviceEstimate.useMutation();
  const fallbackMessage = `السلام عليكم، أود معرفة التقدير الأولي لخدمة من الإشراقة.\nالخدمة: ${service.trim() || "لم أحددها بعد"}\nنوع المكان: ${property.trim() || "لم أحدده بعد"}\nالمساحة أو العدد: ${size.trim() || "لم أحدده بعد"}\nالمدينة أو الحي: ${city.trim() || "لم أحدده بعد"}\nالتفاصيل: ${details.trim() || "لا توجد"}`;
  const whatsappUrl = `https://wa.me/966552610151?text=${encodeURIComponent(estimate.data?.whatsappDraft || fallbackMessage)}`;

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setUploadError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("اختر صورة بصيغة JPG أو PNG أو WebP.");
      return;
    }
    if (file.size > 5_000_000) {
      setUploadError("حجم الصورة يجب ألا يتجاوز 5 ميغابايت.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, mimeType: file.type as EstimateAttachment["mimeType"], dataUrl: String(reader.result) });
    reader.onerror = () => setUploadError("تعذر قراءة الصورة. حاول اختيارها مرة أخرى.");
    reader.readAsDataURL(file);
  }

  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (estimate.isPending) return;
    estimate.mutate({ service: service.trim(), property: property.trim(), size: size.trim(), city: city.trim(), details: details.trim(), ...(attachment ? { attachment } : {}) });
  }

  return (
    <SiteShell>
      <PageMeta title="الحاسبة التقديرية" description="احصل على تقدير أولي توضيحي لخدمة التنظيف أو الصيانة أو نقل العفش قبل التواصل مع فريق الإشراقة." keywords={["حاسبة خدمة", "تقدير تنظيف", "تقدير صيانة", "نقل عفش الإشراقة"]} path="/calculator" />
      <main className="calculator-page" dir="rtl">
        <section className="calculator-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(11,64,70,.94), rgba(11,64,70,.78)), url('/ishraqa-website-backup/media/sofa.jpg')" }}>
          <div className="shell calculator-hero-inner">
            <span className="eyebrow eyebrow-light"><i /> حاسبة الخدمة</span>
            <h1>تقدير أولي يبدأ من التفاصيل.</h1>
            <p>اكتب احتياجك بطريقتك، وأضف صورة اختيارية إن كانت مفيدة. ستظهر لك فئة تقديرية توضيحية تساعدك قبل محادثة فريق الخدمة.</p>
          </div>
        </section>

        <section className="section calculator-section">
          <div className="shell calculator-grid">
            <form className="calculator-form" onSubmit={submitEstimate}>
              <div className="calculator-heading"><Calculator size={24} /><div><span>الخطوة 01</span><h2>صف الخدمة والمكان</h2></div></div>
              <label className="calculator-select">الخدمة التي تحتاجها<input value={service} onChange={(event) => setService(event.target.value)} placeholder="مثال: تنظيف مجلس أو صيانة تكييف" maxLength={160} /></label>

              <div className="calculator-heading"><Sparkles size={24} /><div><span>الخطوة 02</span><h2>أضف التفاصيل التي تراها مهمة</h2></div></div>
              <label className="calculator-select">نوع المكان<input value={property} onChange={(event) => setProperty(event.target.value)} placeholder="مثال: استراحة صغيرة أو مكتب" /></label>
              <label className="calculator-select">الحجم أو المساحة<input value={size} onChange={(event) => setSize(event.target.value)} placeholder="مثال: 180 مترًا أو خمس غرف" /></label>
              <label className="calculator-select">المدينة والحي<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="مثال: الرياض، حي الياسمين" /></label>
              <label className="calculator-select">تفاصيل إضافية <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={900} placeholder="مثال: طابق المكان، عدد القطع، حالة المكان، نوع العطل أو أي تفاصيل مفيدة." /></label>
              <div className="calculator-upload">
                <div><strong>صورة اختيارية</strong><span>JPG أو PNG أو WebP حتى 5 ميغابايت. تساعد في فهم الحالة ولا تُنشر في الموقع.</span></div>
                <label className="calculator-upload-button"><ImagePlus size={18} /> اختر صورة<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} /></label>
              </div>
              {uploadError && <p className="calculator-upload-error" role="alert">{uploadError}</p>}
              {attachment && <div className="calculator-image-preview"><img src={attachment.dataUrl} alt="معاينة الصورة المرفقة للتقدير" /><div><span>{attachment.name}</span><button type="button" onClick={() => setAttachment(null)} aria-label="حذف الصورة المرفقة"><X size={16} /> حذف الصورة</button></div></div>}
              <button className="button calculator-submit" type="submit" disabled={estimate.isPending}>{estimate.isPending ? <><LoaderCircle size={18} className="spin" /> يجهّز التقدير…</> : <>احصل على تقدير أولي <ArrowLeft size={17} /></>}</button>
            </form>

            <aside className="calculator-result" aria-live="polite">
              <span className="eyebrow"><i /> تقدير توضيحي فقط</span>
              <h2>{estimate.data?.estimateBand || "سيظهر التقدير هنا."}</h2>
              {estimate.data ? <>
                <p className="calculator-summary">{estimate.data.summary}</p>
                <div className="calculator-result-group"><strong>ما يؤثر في التقدير</strong>{estimate.data.factors.map((factor) => <div className="result-line" key={factor}><CheckCircle2 size={18} /><p>{factor}</p></div>)}</div>
                {estimate.data.missingDetails.length > 0 && <div className="calculator-result-group"><strong>تفاصيل قد يطلبها الفريق</strong>{estimate.data.missingDetails.map((detail) => <div className="result-line" key={detail}><CheckCircle2 size={18} /><p>{detail}</p></div>)}</div>}
              </> : <p className="calculator-summary">اكتب ما تعرفه عن الخدمة والمكان، ثم اضغط «احصل على تقدير أولي». لا تحتاج إلى اختيار قائمة جاهزة.</p>}
              {estimate.error && <p className="calculator-result-error" role="alert">{estimate.error.message}</p>}
              <p className="calculator-disclaimer">هذا التقدير للتوضيح وتنظيم الطلب فقط، وليس سعرًا نهائيًا. يؤكد فريق الإشراقة التفاصيل والتكلفة بعد مراجعة الحالة والموقع.</p>
              <a className="button calculator-cta" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> تحدث مع فريق الخدمة <ArrowLeft size={17} /></a>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
