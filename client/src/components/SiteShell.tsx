import { ArrowUpLeft, Menu, MessageCircle } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "wouter";

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/articles", label: "المقالات" },
  { href: "/articles#guides", label: "الأدلة" },
  { href: "/articles#contact", label: "تواصل" },
];

export default function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const whatsappUrl = "https://wa.me/966552610151";

  return (
    <div className="site-shell" dir="rtl">
      <header className="site-header">
        <div className="shell-inner header-inner">
          <Link href="/" className="brand" aria-label="العودة إلى الرئيسية">
            <span className="brand-mark" aria-hidden="true"><i /><i /></span>
            <span>
              <b>الإشراقة</b>
              <small>للتنظيف والصيانة ونقل العفش</small>
            </span>
          </Link>

          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="التنقل الرئيسي">
            {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
          </nav>

          <div className="header-actions">
            <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="إظهار روابط التنقل" aria-expanded={menuOpen}>
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {children}

      <footer className="site-footer" id="contact">
        <div className="shell-inner footer-grid">
          <div>
            <div className="brand footer-brand"><span className="brand-mark" aria-hidden="true"><i /><i /></span><b>الإشراقة</b></div>
            <p>محتوى عملي يساعدك على تنظيم العناية بالمنزل، واتخاذ قرار الخدمة بهدوء ووضوح.</p>
          </div>
          <div>
            <h2>استكشف</h2>
            <Link href="/articles">مكتبة المقالات</Link>
            <Link href="/articles#guides">أدلة التنظيف</Link>
          </div>
          <div>
            <h2>تواصل</h2>
            <a href="tel:0552610151">0552610151</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">مراسلة عبر واتساب <ArrowUpLeft size={14} /></a>
          </div>
        </div>
        <div className="shell-inner footer-bottom"><span>© {new Date().getFullYear()} الإشراقة. جميع الحقوق محفوظة.</span><span>المملكة العربية السعودية</span></div>
      </footer>

      <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="التواصل عبر واتساب"><MessageCircle size={23} /></a>
    </div>
  );
}
