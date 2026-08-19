import { ArrowLeft, CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import React from "react";
import { Link, useRoute } from "wouter";
import SiteShell from "@/components/SiteShell";
import PageMeta from "@/components/PageMeta";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getLocalServicePage, getLocalServicePagePath, localServicePages } from "@/data/localServicePages";
import { articleEntries } from "@/pages/ArticleDetail";

function LocalServiceSchema({ page }: { page: NonNullable<ReturnType<typeof getLocalServicePage>> }) {
  const canonical = `https://al-eshraqa.co${getLocalServicePagePath(page.serviceSlug, page.citySlug)}`;
  const organization = { "@type": "Organization", name: "شركة الإشراقة للتنظيف والصيانة ونقل العفش", url: "https://al-eshraqa.co/" };
  const graph = [
    { "@context": "https://schema.org", "@type": "Service", name: page.serviceName, description: page.description, url: canonical, image: page.image, serviceType: page.serviceName, areaServed: { "@type": "City", name: page.cityName, address: { "@type": "PostalAddress", addressCountry: "SA" } }, provider: organization },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://al-eshraqa.co/" }, { "@type": "ListItem", position: 2, name: "الخدمات", item: "https://al-eshraqa.co/services" }, { "@type": "ListItem", position: 3, name: page.serviceName }, { "@type": "ListItem", position: 4, name: page.cityName, item: canonical }] },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

function QuickWhatsappForm({ serviceName, cityName }: { serviceName: string; cityName: string }) {
  return <section className="quick-whatsapp-form" aria-labelledby="quick-whatsapp-title">
    <div><span className="eyebrow">استفسار سريع</span><h2 id="quick-whatsapp-title">اكتب التفاصيل وسنفتح واتساب برسالة جاهزة</h2><p>يكفي أن تذكر الحي ونوع المكان وما تحتاجه؛ لن نطلب منك إدخال رقم التواصل.</p></div>
    <form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const message = `مرحبًا، أرغب في ${serviceName} في ${cityName}.\nالحي: ${data.get("neighbourhood") || "غير محدد"}\nنوع المكان: ${data.get("place") || "غير محدد"}\nالتفاصيل: ${data.get("details") || "لا توجد تفاصيل إضافية"}`; window.open(`https://wa.me/966552610151?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer"); }}>
      <label>الحي<input name="neighbourhood" required placeholder={`مثال: حي في ${cityName}`} autoComplete="address-level3" /></label>
      <label>نوع المكان<input name="place" required placeholder="منزل، شقة، مكتب…" /></label>
      <label className="quick-whatsapp-details">التفاصيل<textarea name="details" required rows={3} placeholder="صف احتياجك باختصار" /></label>
      <button className="button" type="submit"><MessageCircle size={18} />إرسال الاستفسار عبر واتساب</button>
    </form>
  </section>;
}

export default function ServiceCityPage() {
  const [, params] = useRoute("/services/:serviceSlug/:citySlug");
  const page = getLocalServicePage(params?.serviceSlug, params?.citySlug);
  if (!page) return <SiteShell><main className="service-city-page service-city-not-found" dir="rtl"><div className="shell"><h1>صفحة الخدمة غير متاحة</h1><p>يمكنك العودة إلى صفحة الخدمات أو استكشاف الأدلة المنشورة.</p><Link href="/services" className="button">عرض الخدمات <ArrowLeft size={16} /></Link></div></main></SiteShell>;

  const matchingArticles = articleEntries.filter((article) => article.keywords.some((keyword) => keyword.includes(page.cityName) || keyword.includes(page.serviceName) || page.keywords.includes(keyword)));
  const related = [...matchingArticles, ...articleEntries.filter((article) => !matchingArticles.some((match) => match.slug === article.slug))].slice(0, 5);
  const nearby = localServicePages.filter((entry) => entry.citySlug === page.citySlug && entry.serviceSlug !== page.serviceSlug).slice(0, 4);
  const whatsappText = `أرغب في ${page.serviceName} في ${page.cityName}. الحي: …، نوع المكان: …، والأولوية: …`;
  return <SiteShell>
    <PageMeta title={page.title} description={page.description} keywords={[...page.keywords]} path={getLocalServicePagePath(page.serviceSlug, page.citySlug)} image={page.image} imageAlt={page.imageAlt} />
    <LocalServiceSchema page={page} />
    <main className="service-city-page" dir="rtl">
      <header className="service-city-hero"><div className="shell"><Breadcrumb className="seo-breadcrumbs"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link href="/">الرئيسية</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link href="/services">الخدمات</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{page.serviceName} في {page.cityName}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><span className="eyebrow"><i /> دليل خدمة محلي</span><h1>{page.title}</h1><p>{page.description}</p><div className="service-city-hero-actions"><a className="button" href={`https://wa.me/966552610151?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> اشرح احتياجك عبر واتساب</a><Link className="button button-ghost" href="/articles">استكشف الأدلة <ArrowLeft size={16} /></Link></div></div></header>
      <article className="section service-city-reading"><div className="shell"><figure className="service-city-image"><img src={page.image} alt={page.imageAlt} loading="eager" decoding="async" /><figcaption>صورة توضيحية لخدمة {page.serviceName}؛ لا تمثل نتيجة فعلية أو سعرًا.</figcaption></figure>
        <section className="service-city-copy"><h2>كيف نرتب {page.serviceName} في {page.cityName}؟</h2><p>{page.serviceDetail}</p><p>{page.cityDetail}</p><p>تظهر في نتائج البحث عبارات مثل «أرخص شركة» أو «خدمة فورية»، لكن الاختيار المسؤول لا يقوم على وعد مختصر. اشرح حالتك وما تريد الوصول إليه، ثم راجع ملاءمة الخدمة للمكان قبل تثبيت أي توقعات عن السعر أو الموعد أو النتيجة.</p></section>
        <section className="service-city-workflow" aria-labelledby="service-city-workflow-title"><div><span className="eyebrow">قبل طلب الخدمة</span><h2 id="service-city-workflow-title">مسار بسيط لترتيب {page.serviceName}</h2><p>هذه الخطوات تساعدك على إرسال معلومات مفيدة من البداية؛ ولا تحل محل المراجعة الفعلية للحالة أو للمكان.</p></div><ol>{page.serviceSteps.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section>
        <section className="service-city-local-tips" aria-labelledby="service-city-local-tips-title"><span className="eyebrow">تنظيم الطلب في {page.cityName}</span><h2 id="service-city-local-tips-title">تفاصيل صغيرة تجعل الرسالة أوضح</h2><ul>{page.cityTips.map((tip) => <li key={tip}><CheckCircle2 size={18} aria-hidden="true" /><span>{tip}</span></li>)}</ul></section>
        <section className="service-city-neighbourhoods" aria-label={`أحياء ${page.cityName} المذكورة في الدليل`}><div><span className="eyebrow">مناطق يكثر السؤال عنها</span><h2>ابدأ بذكر الحي وطبيعة الوصول</h2><p>هذه أمثلة لمناطق داخل {page.cityName} تساعد على ترتيب وصف الموقع، ولا تعني وحدها توافرًا مؤكدًا للخدمة.</p></div><ul>{page.neighbourhoods.map((neighbourhood) => <li key={neighbourhood}><MapPin size={16} /> {neighbourhood}</li>)}</ul></section>
        <section className="service-city-preparation"><CheckCircle2 size={24} /><div><h2>تجهيز بسيط قبل التواصل</h2><p>{page.preparation}</p></div></section>
        <QuickWhatsappForm serviceName={page.serviceName} cityName={page.cityName} />
        <section className="service-city-faq" aria-label={`أسئلة شائعة عن ${page.serviceName} في ${page.cityName}`}><span className="eyebrow">أسئلة شائعة</span><h2>إجابات مختصرة قبل إرسال الطلب</h2>{page.faq.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</section>
        <section className="service-city-related"><div><span className="eyebrow">مقالات ذات صلة</span><h2>خمسة أدلة تساعدك قبل ترتيب الخطوة التالية</h2></div><div className="service-city-related-grid">{related.map((article) => <Link href={`/articles/${article.slug}`} key={article.slug}><strong>{article.title}</strong><span>فتح الدليل <ArrowLeft size={14} /></span></Link>)}</div></section>
        <section className="service-city-nearby"><h2>خدمات أخرى في {page.cityName}</h2><div>{nearby.map((entry) => <Link href={getLocalServicePagePath(entry.serviceSlug, entry.citySlug)} key={entry.serviceSlug}>{entry.serviceName} <ArrowLeft size={14} /></Link>)}</div></section>
      </div></article>
    </main>
  </SiteShell>;
}
