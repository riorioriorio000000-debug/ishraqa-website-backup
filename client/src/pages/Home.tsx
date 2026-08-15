import { ArrowLeft, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";
import { articles } from "@/content/articles";

export default function Home() {
  const featured = articles.slice(0, 4);
  return (
    <SiteShell>
      <main>
        <section className="home-hero">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="shell-inner hero-grid">
            <div>
              <span className="eyebrow"><Sparkles size={15} /> دليل هادئ للعناية بالمنزل</span>
              <h1>بيتك أنظف.<br /><em>يومك أخف.</em></h1>
              <p>الإشراقة تجمع لك دليلاً واضحًا حول العناية بالتفاصيل اليومية، مع طرق للتواصل وشرح احتياجك بدون تعقيد.</p>
              <div className="hero-actions"><Link href="/articles" className="primary-link">استكشف المقالات <ArrowLeft size={17} /></Link><a href="https://wa.me/966552610151" target="_blank" rel="noreferrer" className="secondary-link">تواصل عبر واتساب <MessageCircle size={17} /></a></div>
            </div>
            <div className="hero-panel"><span>مكتبة عملية</span><b>{articles.length}</b><small>مقالًا حول التنظيف<br />والصيانة المنزلية</small><div className="hero-panel-lines"><i /><i /><i /></div></div>
          </div>
        </section>

        <section className="home-guides shell-inner">
          <div className="section-heading"><div><span className="eyebrow"><BookOpen size={15} /> ابدأ من هنا</span><h2>أدلة مختارة بعناية</h2><p>موضوعات عملية تعالج أكثر النقاط التي تحتاج إليها الأسرة في المكان اليومي.</p></div><Link href="/articles">المكتبة كاملة <ArrowLeft size={16} /></Link></div>
          <div className="home-card-grid">{featured.map((article) => <article className="home-card" key={article.slug}><span>{article.category}</span><h3>{article.title}</h3><p>{article.excerpt}</p><Link href={`/articles/${article.slug}`}>قراءة المقال <ArrowLeft size={15} /></Link></article>)}</div>
        </section>

        <section className="home-contact"><div className="shell-inner"><div><span className="eyebrow">خطوة واحدة كافية</span><h2>اكتب ما تحتاجه،<br />ونرتب البداية معك.</h2></div><a href="https://wa.me/966552610151" target="_blank" rel="noreferrer">ابدأ محادثة <MessageCircle size={18} /></a></div></section>
      </main>
    </SiteShell>
  );
}
