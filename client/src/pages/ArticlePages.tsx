import { ArrowLeft, Check, ChevronLeft, Clipboard, Facebook, MessageCircle, Search, Share2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";
import { articleCategories, articles, getArticleBySlug, type Article } from "@/content/articles";
import "./article-cover.css";

const siteUrl = "https://al-eshraqa.co";
const articleCover = "/manus-storage/ishraqa-article-cover_969d1964.png";

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    if (property) element.setAttribute("property", name); else element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function PageMeta({ title, description, canonical, article }: { title: string; description: string; canonical: string; article?: Article }) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", article ? "article" : "website", true);
    setMeta("og:url", canonical, true);
    if (article) {
      setMeta("og:image", articleCover, true);
      setMeta("og:image:alt", article.imageAlt, true);
      setMeta("twitter:image", articleCover);
      setMeta("twitter:image:alt", article.imageAlt);
    }
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
    const scriptId = "page-structured-data";
    document.getElementById(scriptId)?.remove();
    if (article) {
      setMeta("keywords", `${article.focusKeyword}, ${article.category}, الإشراقة`);
      setMeta("article:section", article.category, true);
      setMeta("article:tag", article.focusKeyword, true);
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        mainEntityOfPage: canonical,
        keywords: article.focusKeyword,
        author: { "@type": "Organization", name: "الإشراقة" },
        publisher: { "@type": "Organization", name: "الإشراقة" },
      };
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, canonical, article]);
  return null;
}

function visualFor(category: string) {
  const letters = category.replace(/\s+/g, " ").trim().split(" ").slice(0, 2).map((word) => word[0]).join("");
  return <div className="article-visual" aria-hidden="true"><span>{letters}</span><i /><i /><i /></div>;
}

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article className={`article-card ${featured ? "featured-card" : ""}`}>
      {visualFor(article.category)}
      <div className="article-card-copy">
        <div className="card-meta"><span>{article.category}</span><span className="keyword-dot">{article.focusKeyword}</span></div>
        <h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2>
        <p>{article.excerpt}</p>
        <Link className="read-link" href={`/articles/${article.slug}`}>قراءة المقال <ArrowLeft size={16} /></Link>
      </div>
    </article>
  );
}

function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <div className="article-prose">
      {blocks.map((block, index) => {
        if (block.startsWith("# ")) return <h1 key={index}>{block.slice(2)}</h1>;
        if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
        if (block.startsWith("### ")) return <h3 key={index}>{block.slice(4)}</h3>;
        if (block.startsWith("- ")) return <ul key={index}>{block.split("\n").map((item) => <li key={item}>{item.replace(/^-\s*/, "")}</li>)}</ul>;
        return <p key={index}>{block.replace(/\n/g, " ")}</p>;
      })}
    </div>
  );
}

export function ArticlesIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => articles.filter((article) => {
    const matchesCategory = category === "الكل" || article.category === category;
    const haystack = `${article.title} ${article.excerpt} ${article.focusKeyword} ${article.category}`.toLowerCase();
    return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
  }), [category, normalizedQuery]);

  return (
    <SiteShell>
      <PageMeta title="مقالات الإشراقة | أدلة عملية للتنظيف والصيانة" description="مكتبة الإشراقة لمقالات التنظيف والصيانة والعناية المنزلية: أدلة عملية، نصائح آمنة، وخيارات منظمة للعناية بالمكان." canonical={`${siteUrl}/articles`} />
      <main>
        <section className="articles-hero" id="guides">
          <div className="shell-inner">
            <span className="eyebrow"><Sparkles size={15} /> مكتبة الإشراقة</span>
            <h1>كل ما تحتاجه لعناية منزلية<br />أهدأ وأكثر وضوحًا.</h1>
            <p>أدلة تحريرية منظمة حول التنظيف والصيانة وتجهيز المنزل، مكتوبة لتسهيل الخطوة التالية دون إغراق بالتفاصيل.</p>
            <div className="search-shell">
              <Search size={19} />
              <label className="sr-only" htmlFor="article-search">ابحث في المقالات</label>
              <input id="article-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بكلمة مثل تنظيف، مطبخ، مكيف..." />
              <span>{filtered.length} مقالة</span>
            </div>
          </div>
        </section>

        <section className="articles-section shell-inner">
          <div className="filter-row" aria-label="تصنيفات المقالات">
            {["الكل", ...articleCategories].map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          {filtered.length ? <div className="article-grid">{filtered.map((article, index) => <ArticleCard article={article} featured={index < 4 && !query && category === "الكل"} key={article.slug} />)}</div> : <div className="empty-state"><Search size={26} /><h2>لا توجد نتيجة مطابقة الآن</h2><p>جرّب عبارة أقصر أو اختر تصنيفًا آخر.</p></div>}
        </section>
      </main>
    </SiteShell>
  );
}

export function ArticleDetail({ slug }: { slug: string }) {
  const article = getArticleBySlug(slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => window.scrollTo({ top: 0, behavior: "instant" }), [slug]);
  if (!article) {
    return <SiteShell><main className="article-detail"><div className="shell-inner article-container"><div className="empty-state"><Search size={26} /><h1>لم نجد هذا المقال</h1><p>قد يكون الرابط قد تغيّر أو أن المقال غير متاح الآن.</p><Link className="primary-link" href="/articles">العودة إلى مكتبة المقالات <ArrowLeft size={16} /></Link></div></div></main></SiteShell>;
  }
  const canonical = `${siteUrl}/articles/${article.slug}`;
  const related = articles.filter((item) => item.slug !== article.slug).sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category)).slice(0, 3);
  const shareText = `اقرأ: ${article.title}`;
  const shareUrl = encodeURIComponent(canonical);
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${canonical}`)}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const copyLink = async () => { await navigator.clipboard?.writeText(canonical); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  return (
    <SiteShell>
      <PageMeta title={`${article.title} | الإشراقة`} description={article.description} canonical={canonical} article={article} />
      <main className="article-detail">
        <div className="shell-inner article-container">
          <div className="crumb-row"><Link href="/articles"><ChevronLeft size={16} /> كل المقالات</Link><span>{article.category}</span></div>
          <header className="detail-head">
            <span className="eyebrow">{article.focusKeyword}</span>
            <h1>{article.title}</h1>
            <p>{article.description}</p>
            <figure className="article-cover">
              <img src={articleCover} alt={article.imageAlt} loading="eager" />
            </figure>
            <div className="article-actions" aria-label="مشاركة المقال">
              <span><Share2 size={16} /> مشاركة المقال</span>
              <a href={whatsappShare} target="_blank" rel="noreferrer" aria-label="مشاركة المقال عبر واتساب"><MessageCircle size={18} /></a>
              <a href={facebookShare} target="_blank" rel="noreferrer" aria-label="مشاركة المقال عبر فيسبوك"><Facebook size={18} /></a>
              <button type="button" onClick={copyLink} aria-label="نسخ رابط المقال">{copied ? <Check size={18} /> : <Clipboard size={18} />}</button>
            </div>
          </header>

          <div className="article-reading-layout">
            <aside className="article-aside"><div className="aside-keyword">{article.focusKeyword}</div><p>دليل من مكتبة الإشراقة لمساعدتك على اختيار الخطوة المناسبة بهدوء.</p></aside>
            <ArticleBody body={article.body} />
          </div>

          <section className="article-cta"><div><span className="eyebrow">عند الحاجة</span><h2>هل تريد من يساعدك في ترتيب التفاصيل؟</h2><p>تواصل مع الإشراقة واشرح ما تحتاجه بالطريقة التي تفضّلها.</p></div><a href="https://wa.me/966552610151" target="_blank" rel="noreferrer">مراسلة واتساب <MessageCircle size={17} /></a></section>

          <section className="related-section"><div className="section-heading"><div><span className="eyebrow">تابع القراءة</span><h2>مقالات ذات صلة</h2></div><Link href="/articles">عرض المكتبة <ArrowLeft size={16} /></Link></div><div className="article-grid related-grid">{related.map((item) => <ArticleCard article={item} key={item.slug} />)}</div></section>
        </div>
      </main>
    </SiteShell>
  );
}
