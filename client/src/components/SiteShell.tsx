// Design reminder: calm editorial service brand; keep navigation airy, warm, and practical with deep teal actions.
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import BrandMark from "./BrandMark";
import WhatsAppFloat from "./WhatsAppFloat";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand-lockup" onClick={close}><BrandMark size={68} /></Link>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/services">خدماتنا</Link><Link href="/calculator" className="calculator-nav-link">حاسبة الخدمة <span>جديد</span></Link><a href="/#coverage">نطاق الخدمة</a><Link href="/articles">المقالات</Link><Link href="/customer-service">خدمة العملاء</Link><Link href="/faq">الأسئلة الشائعة</Link>
        </nav>
        <div className="header-actions"><a className="header-phone" href="tel:0509614797"><Phone size={15} />0509614797</a><Link href="/booking" className="header-booking-button">احجز الآن</Link><button className="menu-toggle" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      {open && <nav className="mobile-nav" aria-label="التنقل المحمول"><Link href="/services" onClick={close}>خدماتنا</Link><Link href="/calculator" className="calculator-nav-link" onClick={close}>حاسبة الخدمة <span>جديد</span></Link><a href="/#coverage" onClick={close}>نطاق الخدمة</a><Link href="/articles" onClick={close}>المقالات</Link><Link href="/customer-service" onClick={close}>خدمة العملاء الذكية</Link><Link href="/faq" onClick={close}>الأسئلة الشائعة</Link></nav>}
    </header>
  );
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><div className="brand-lockup footer-brand"><BrandMark size={50} /></div><p>خدمات تنظيف وصيانة ونقل عفش بهدوء ووضوح، لسكان المدن السعودية.</p></div><div><h3>روابط سريعة</h3><Link href="/services">الخدمات</Link><Link href="/calculator">حاسبة الخدمة</Link><Link href="/booking">الحجز</Link><Link href="/articles">المقالات</Link><Link href="/customer-service">خدمة العملاء الذكية</Link><Link href="/faq">الأسئلة الشائعة</Link></div><div><h3>تواصل معنا</h3><a href="tel:0509614797"><Phone size={15} /> 0509614797</a><a href="https://wa.me/966509614797" target="_blank" rel="noreferrer"><MessageCircle size={15} /> واتساب</a><a href="https://www.facebook.com/profile.php?id=61574523787419" target="_blank" rel="noreferrer">فيسبوك</a></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} الإشراقة. جميع الحقوق محفوظة.</span><span>نرتّب التفاصيل بهدوء، لتعود إلى يومك بخفة.</span></div></footer>;
}

export default function SiteShell({ children }: { children: React.ReactNode }) { return <div className="site-frame"><SiteHeader />{children}<section className="site-tail" dir="rtl"><div className="shell site-tail-grid"><div><span className="eyebrow"><i /> خطوة تالية أوضح</span><h2>كل ما تحتاجه<br /><em>قريب منك.</em></h2><p>إن لم تكن مستعدًا للحجز الآن، يمكنك قراءة دليل عملي أو حساب الاحتياج أو سؤال المساعد قبل إرسال أي رسالة.</p></div><div className="site-tail-links"><Link href="/calculator">حاسبة الخدمة <span>تقدير أولي بلا سعر ثابت</span></Link><Link href="/articles">دليل العناية <span>قراءات وخطوات عملية</span></Link><Link href="/customer-service">اسأل المساعد <span>شرح وبحث داخل الموقع</span></Link></div></div></section><SiteFooter /><WhatsAppFloat /></div>; }
