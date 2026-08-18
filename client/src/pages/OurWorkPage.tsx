import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import ServiceVideo from "@/components/ServiceVideo";
import SiteShell from "@/components/SiteShell";
import { workVideos } from "@/data/workVideos";

export default function OurWorkPage() {
  return <SiteShell><PageMeta title="أعمالنا الحقيقية" description="شاهد مقاطع قصيرة من أعمال الإشراقة الحقيقية في تنظيف الكنب والمفروشات والأفران والتكييف والخزانات المنزلية." keywords={["أعمال تنظيف كنب", "تنظيف مفروشات", "تنظيف أفران الغاز", "صيانة تكييف", "تنظيف خزانات", "شركة الإشراقة", "خدمات منزلية"]} path="/our-work" /><main dir="rtl"><section className="our-work-hero"><div className="shell our-work-hero-grid"><div><span className="eyebrow"><i /> أعمال موثقة</span><h1>أعمالنا،<br /><em>بتفاصيل أقرب.</em></h1><p>مقاطع حقيقية مختارة من أعمال تنظيف الكنب والمفروشات والأفران، إلى جانب التكييف والخزانات. اضغط تشغيل الفيديو أو استخدم زر الصوت عند الحاجة.</p></div><div className="our-work-hero-note"><span>٦</span><strong>مقاطع أعمال حقيقية</strong><small>تُحمَّل عند الاقتراب حفاظًا على سرعة الصفحة.</small></div></div></section><section className="section section-paper our-work-gallery"><div className="shell"><div className="section-heading"><div><span className="eyebrow">مختارات من الخدمة</span><h2>كل مقطع في<br /><em>مربع صغير وواضح.</em></h2></div><p>المقاطع تعرض العمل نفسه دون صور أو وجوه للأشخاص. يمكن تشغيل أي مقطع والتحكم بصوته مباشرة من أدوات الفيديو.</p></div><div className="our-work-video-grid" aria-label="فيديوهات أعمال الإشراقة الحقيقية">{workVideos.map((video) => <ServiceVideo key={video.src} {...video} compact />)}</div><div className="our-work-next"><div><span className="eyebrow">الخطوة التالية</span><h2>هل لديك خدمة قريبة من احتياجك؟</h2><p>راجع الخدمات المتاحة ثم أرسل التفاصيل عبر واتساب لتنسيق الطلب.</p></div><Link href="/services" className="button">استكشف الخدمات <ArrowLeft size={16} /></Link></div></div></section></main></SiteShell>;
}
