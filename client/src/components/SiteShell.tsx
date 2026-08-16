// Design reminder: calm editorial service brand; keep navigation airy, warm, and practical with deep teal actions.
import { ChevronDown, Menu, MessageCircle, Phone, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import React, { useState } from "react";
import BrandMark from "./BrandMark";
import WhatsAppFloat from "./WhatsAppFloat";
import SiteVisitorCount from "./SiteVisitorCount";
import ArticleComments from "./ArticleComments";
import ServicePageVisitTracker from "./ServicePageVisitTracker";
import NotificationBell from "./NotificationBell";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location] = useLocation();
  const hasDarkBackground = location === "/customer-service" || location === "/calculator";
  const close = () => { setOpen(false); setMoreOpen(false); };
  return (
    <header className={`site-header${hasDarkBackground ? " site-header-on-dark" : ""}`}>
      <div className="shell header-inner">
        <Link href="/" className="brand-lockup" onClick={close} aria-label="العودة إلى الصفحة الرئيسية للإشراقة"><BrandMark size={54} /><span className="brand-copy"><strong>الإشراقة</strong><small>للتنظيف والصيانة ونقل العفش</small></span></Link>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/" className="nav-home-link" onClick={close}>الرئيسية</Link><Link href="/services">خدماتنا</Link><Link href="/calculator" className="calculator-nav-link">حاسبة الخدمة <span>جديد</span></Link><Link href="/articles">المقالات</Link><Link href="/customer-service" className="calculator-nav-link">خدمة العملاء <span>جديد</span></Link><div className="nav-more"><button type="button" className="nav-more-trigger" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen(value => !value)}>المزيد <ChevronDown size={15} aria-hidden="true" /></button>{moreOpen && <div className="nav-more-menu" role="menu"><Link href="/where-we-work" role="menuitem" onClick={close}>أين نعمل</Link><Link href="/about" role="menuitem" onClick={close}>عن الإشراقة</Link><Link href="/faq" role="menuitem" onClick={close}>الأسئلة الشائعة</Link><Link href="/booking" role="menuitem" onClick={close}>الحجز</Link></div>}</div>
        </nav>
        <div className="header-actions"><NotificationBell /><button className="menu-toggle" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      {open && <nav className="mobile-nav" aria-label="التنقل المحمول"><Link href="/" className="nav-home-link" onClick={close}>الرئيسية</Link><Link href="/services" onClick={close}>خدماتنا</Link><Link href="/calculator" className="calculator-nav-link" onClick={close}>حاسبة الخدمة <span>جديد</span></Link><Link href="/articles" onClick={close}>المقالات</Link><Link href="/customer-service" className="calculator-nav-link" onClick={close}>خدمة العملاء <span>جديد</span></Link><details className="mobile-nav-more"><summary>المزيد <ChevronDown size={16} aria-hidden="true" /></summary><Link href="/where-we-work" onClick={close}>أين نعمل</Link><Link href="/about" onClick={close}>عن الإشراقة</Link><Link href="/faq" onClick={close}>الأسئلة الشائعة</Link><Link href="/booking" onClick={close}>الحجز</Link></details></nav>}
    </header>
  );
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><div className="brand-lockup footer-brand"><BrandMark size={50} /><span className="brand-copy"><strong>الإشراقة</strong><small>للتنظيف والصيانة ونقل العفش</small></span></div><p>خدمات تنظيف وصيانة ونقل عفش بهدوء ووضوح، لسكان المدن السعودية.</p></div><div><h3>روابط سريعة</h3><Link href="/services">الخدمات</Link><Link href="/calculator">حاسبة الخدمة</Link><Link href="/booking">الحجز</Link><Link href="/articles">المقالات</Link><Link href="/customer-service">خدمة العملاء الذكية</Link><Link href="/faq">الأسئلة الشائعة</Link></div><div><h3>تواصل معنا</h3><a href="https://wa.me/966552610151" target="_blank" rel="noreferrer" aria-label="التواصل مع الإشراقة عبر واتساب على الرقم 0552610151"><Phone size={15} /> 0552610151</a><a href="https://wa.me/966552610151" target="_blank" rel="noreferrer"><MessageCircle size={15} /> واتساب</a><a href="https://www.facebook.com/profile.php?id=61574523787419" target="_blank" rel="noreferrer">فيسبوك</a></div></div><div className="shell footer-bottom"><SiteVisitorCount /><span>© {new Date().getFullYear()} الإشراقة. جميع الحقوق محفوظة.</span><span>نرتّب التفاصيل بهدوء، لتعود إلى يومك بخفة.</span></div></footer>;
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const shouldShowPageComments = !location.startsWith("/articles/") && location !== "/articles" && location !== "/notifications";
  const pageKey = location === "/" ? "page:home" : `page:${location}`;
  return <div className="site-frame"><SiteHeader /><ServicePageVisitTracker />{children}{shouldShowPageComments && <section className="page-comments-section section section-paper" dir="rtl"><div className="shell"><ArticleComments pageKey={pageKey} showLinkedRating={false} /></div></section>}<section className="site-tail" dir="rtl"><div className="shell site-tail-grid"><div><span className="eyebrow"><i /> خطوة تالية أوضح</span><h2>كل ما تحتاجه<br /><em>قريب منك.</em></h2><p>إن لم تكن مستعدًا للحجز الآن، يمكنك قراءة دليل عملي أو حساب الاحتياج أو سؤال المساعد قبل إرسال أي رسالة.</p></div><div className="site-tail-links"><Link href="/calculator">حاسبة الخدمة <span>تقدير أولي بلا سعر ثابت</span></Link><Link href="/articles">دليل العناية <span>قراءات وخطوات عملية</span></Link><Link href="/customer-service">اسأل المساعد <span>شرح وبحث داخل الموقع</span></Link></div></div></section><SiteFooter /><WhatsAppFloat /></div>;
}
