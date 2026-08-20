import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import ServiceVideo from "@/components/ServiceVideo";
import SiteShell from "@/components/SiteShell";
import { workPhotos } from "@/data/workPhotos";
import { workVideoServiceFilters, workVideos, type WorkVideoServiceFilter } from "@/data/workVideos";

export default function OurWorkPage() {
  const [selectedService, setSelectedService] = useState<WorkVideoServiceFilter>("all");
  const visibleVideos = useMemo(
    () => (selectedService === "all" ? workVideos : workVideos.filter((video) => video.serviceId === selectedService)),
    [selectedService],
  );

  return (
    <SiteShell>
      <PageMeta
        title="أعمالنا الحقيقية"
        description="شاهد مقاطع الأعمال وصورة ميدانية موثقة من خدمات الإشراقة في التنظيف والصيانة والعناية المنزلية."
        keywords={["أعمال تنظيف", "صور صيانة منزلية", "تنظيف خزانات", "صيانة تكييف", "مكافحة حشرات", "شركة الإشراقة"]}
        path="/our-work"
      />
      <main dir="rtl">
        <section className="our-work-hero">
          <div className="shell our-work-hero-grid">
            <div>
              <span className="eyebrow"><i /> أعمال موثقة</span>
              <h1>أعمالنا،<br /><em>بتفاصيل أقرب.</em></h1>
              <p>مقاطع أعمال وصورة ميدانية مختارة من خدمات التنظيف والصيانة المنزلية. تقتصر الصور الثابتة على لقطات بلا أشخاص. اختر نوع الخدمة لتصفية المقاطع ثم افتح الفيديو للتفاعل.</p>
            </div>
            <div className="our-work-hero-note"><span>{workVideos.length}</span><strong>مقاطع أعمال حقيقية</strong><small>تُحمَّل عند الاقتراب حفاظًا على سرعة الصفحة.</small></div>
          </div>
        </section>
        <section className="section section-paper our-work-gallery">
          <div className="shell">
            <div className="section-heading">
              <div><span className="eyebrow">مختارات من الخدمة</span><h2>كل مقطع في<br /><em>مربع صغير وواضح.</em></h2></div>
              <p>توضح المقاطع مواضع تنفيذ الخدمة، بينما يقتصر معرض الصور الثابتة على لقطات لا تظهر أشخاصًا. يظهر لكل مقطع رابط للخدمة ومؤشر مشاهدة وتفاعل من زوار الموقع.</p>
            </div>

            <section className="our-work-photo-section" aria-labelledby="work-photos-heading">
              <div className="our-work-photo-intro">
                <div><span className="eyebrow">صورة ميدانية موثقة</span><h3 id="work-photos-heading">صورة من أعمالنا</h3></div>
                <p>صورة فوتوغرافية من موضع خدمة فعلي، مع وصف واضح ورابط إلى خدمة العناية بالخزانات ذات الصلة.</p>
              </div>
              <div className="our-work-photo-grid" aria-label="صورة ميدانية من أعمال الإشراقة">
                {workPhotos.map((photo) => (
                  <article className="our-work-photo-card" key={photo.src}>
                    <Link href={photo.servicePath} className="our-work-photo-image" aria-label={`عرض خدمة: ${photo.title}`}>
                      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
                    </Link>
                    <div className="our-work-photo-copy">
                      <h4>{photo.title}</h4>
                      <p>{photo.description}</p>
                      <Link href={photo.servicePath} className="our-work-photo-link">عرض الخدمة <ArrowLeft size={15} aria-hidden="true" /></Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="our-work-filters" aria-label="تصفية فيديوهات الأعمال حسب الخدمة">
              {workVideoServiceFilters.map((filter) => (
                <button key={filter.id} type="button" className={selectedService === filter.id ? "active" : ""} onClick={() => setSelectedService(filter.id)} aria-pressed={selectedService === filter.id}>{filter.label}</button>
              ))}
            </div>
            <div className="our-work-video-grid" aria-label="فيديوهات أعمال الإشراقة الحقيقية">
              {visibleVideos.map((video) => <ServiceVideo key={video.src} {...video} compact />)}
            </div>
            <div className="our-work-next">
              <div><span className="eyebrow">الخطوة التالية</span><h2>هل لديك خدمة قريبة من احتياجك؟</h2><p>راجع الخدمات المتاحة ثم أرسل التفاصيل عبر واتساب لتنسيق الطلب.</p></div>
              <Link href="/services" className="button">استكشف الخدمات <ArrowLeft size={16} /></Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
