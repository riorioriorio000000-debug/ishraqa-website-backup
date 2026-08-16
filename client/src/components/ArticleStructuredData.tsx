import React from "react";
import type { ArticleEntry } from "@/pages/ArticleDetail";

function articleVisual(article: ArticleEntry) {
  const subject = `${article.slug} ${article.title}`.toLowerCase();
  if (/(ac-|maintenance|تكييف|صيانة)/.test(subject)) {
    return { src: "/manus-storage/maintenance-tools-720w_14b5c2ac.png", srcSet: "/manus-storage/maintenance-tools-360w_0405e169.png 360w, /manus-storage/maintenance-tools-720w_14b5c2ac.png 720w", alt: `رسم أدوات الصيانة المنزلية المصاحب لمقال ${article.title}` };
  }
  if (/(furniture|moving|نقل|عفش)/.test(subject)) {
    return { src: "/manus-storage/moving-box-720w_8c727804.png", srcSet: "/manus-storage/moving-box-360w_f82108eb.png 360w, /manus-storage/moving-box-720w_8c727804.png 720w", alt: `رسم توضيحي لنقل العفش المصاحب لمقال ${article.title}` };
  }
  return { src: "/manus-storage/cleaning-caddy-720w_1d6eb6fe.png", srcSet: "/manus-storage/cleaning-caddy-360w_e0c8e5c3.png 360w, /manus-storage/cleaning-caddy-720w_1d6eb6fe.png 720w", alt: `رسم أدوات تنظيف منزلية مصاحب لمقال ${article.title}` };
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
    image: article.shareImage,
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
        url: "https://al-eshraqa.co/manus-storage/ishraqa-user-logo_64a160a3.png",
      },
    },
  };
  const breadcrumbPayload = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://al-eshraqa.co/" },
      { "@type": "ListItem", position: 2, name: "المقالات", item: "https://al-eshraqa.co/articles" },
      { "@type": "ListItem", position: 3, name: article.title, item: canonicalUrl },
    ],
  };

  const visual = articleVisual(article);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbPayload) }} /><figure className="article-visual"><img src={visual.src} srcSet={visual.srcSet} sizes="(max-width: 640px) 76vw, 420px" alt={visual.alt} loading="lazy" decoding="async" /><figcaption>مرئي توضيحي من خدمات الإشراقة</figcaption></figure></>;
}
