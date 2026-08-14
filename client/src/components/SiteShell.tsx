// Design reminder: calm editorial service brand; keep navigation airy, warm, and practical with deep teal actions.
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import BrandMark from "./BrandMark";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand-lockup" onClick={close}>
          <BrandMark size={54} />
          <span className="brand-copy"><strong>الإشراقة</strong><small>تنظيف · صيانة · نقل عفش</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/services">خدماتنا</Link><a href="/#why">لماذا الإشراقة؟</a><a href="/#coverage">نطاق الخدمة</a><Link href="/articles">المقالات</Link><Link href="/faq">الأسئلة الشائعة</Link>
        </nav>
        <div className="header-actions"><a className="header-phone" href="tel:0509614797"><Phone size={15} />0509614797</a><Link href="/booking" className="button button-small">احجز الآن</Link><button className="menu-toggle" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      {open && <nav className="mobile-nav" aria-label="التنقل المحمول"><Link href="/services" onClick={close}>خدماتنا</Link><a href="/#why" onClick={close}>لماذا الإشراقة؟</a><a href="/#coverage" onClick={close}>نطاق الخدمة</a><Link href="/articles" onClick={close}>المقالات</Link><Link href="/faq" onClick={close}>الأسئلة الشائعة</Link><Link href="/booking" className="button" onClick={close}>ابدأ الحجز</Link></nav>}
    </header>
  );
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><div className="brand-lockup footer-brand"><BrandMark size={48} /><span className="brand-copy"><strong>الإشراقة</strong><small>عناية تُرى، وراحة تُحس</small></span></div><p>خدمات تنظيف وصيانة ونقل عفش بهدوء ووضوح، لسكان المدن السعودية.</p></div><div><h3>روابط سريعة</h3><Link href="/services">الخدمات</Link><Link href="/booking">الحجز</Link><Link href="/articles">المقالات</Link><Link href="/faq">الأسئلة الشائعة</Link></div><div><h3>تواصل معنا</h3><a href="tel:0509614797"><Phone size={15} /> 0509614797</a><a href="tel:0552610151"><Phone size={15} /> 0552610151 — الخيال كلين</a><a href="mailto:hello@ishraqa.sa">hello@ishraqa.sa</a><a href="https://wa.me/966552610151" target="_blank" rel="noreferrer"><MessageCircle size={15} /> واتساب</a></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} الإشراقة. جميع الحقوق محفوظة.</span><span>النطاق محفوظ — هذه نسخة احتياطية للمراجعة</span></div></footer>;
}

export default function SiteShell({ children }: { children: React.ReactNode }) { return <div className="site-frame"><SiteHeader />{children}<SiteFooter /></div>; }
