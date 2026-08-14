import React from "react";
import type { ArticleEntry } from "@/pages/ArticleDetail";

function articleVisual(article: ArticleEntry) {
  const subject = `${article.slug} ${article.title}`.toLowerCase();
  if (/(ac-|maintenance|تكييف|صيانة)/.test(subject)) {
    return { src: "/manus-storage/maintenance-tools-transparent_75e7c68e.png", alt: `رسم أدوات الصيانة المنزلية المصاحب لمقال ${article.title}` };
  }
  if (/(furniture|moving|نقل|عفش)/.test(subject)) {
    return { src: "/manus-storage/moving-box-transparent_9c5b10ea.png", alt: `رسم توضيحي لنقل العفش المصاحب لمقال ${article.title}` };
  }
  return { src: "/manus-storage/ishraqa-cleaning-caddy_6deee5d6.png", alt: `رسم أدوات تنظيف منزلية مصاحب لمقال ${article.title}` };
}

export default function ArticleStructuredData({ article }: { article: ArticleEntry }) {
  const canonicalUrl = `https://al-eshraqa.co/articles/${article.slug}`;
  const payload = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.intro,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    inLanguage: "ar-SA",
    keywords: article.keywords.join(", "),
    datePublished: "2026-08-14T00:00:00+03:00",
    dateModified: "2026-08-14T00:00:00+03:00",
    author: {
      "@type": "Organization",
      name: "شركة الإشراقة للتنظيف والصيانة ونقل العفش",
      url: "https://al-eshraqa.co/about",
    },
    publisher: {
      "@type": "Organization",
      name: "شركة الإشراقة للتنظيف والصيانة ونقل العفش",
      url: "https://al-eshraqa.co/",
      logo: {
        "@type": "ImageObject",
        url: "https://al-eshraqa.co/manus-storage/ishraqa-blue-mark_51e1bd1d.png",
      },
    },
  };

  const visual = articleVisual(article);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} /><figure className="article-visual"><img src={visual.src} alt={visual.alt} /><figcaption>مرئي توضيحي من خدمات الإشراقة</figcaption></figure></>;
}
