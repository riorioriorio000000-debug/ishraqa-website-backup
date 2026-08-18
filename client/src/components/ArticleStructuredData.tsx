import React from "react";
import type { ArticleEntry } from "@/pages/ArticleDetail";

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

  const visual = article.image ? { src: article.image, alt: article.imageAlt ?? `صورة مرتبطة بمقال ${article.title}` } : null;
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbPayload) }} />{visual && <figure className="article-visual"><img src={visual.src} srcSet={`${visual.src} 720w`} sizes="(max-width: 640px) 76vw, 420px" alt={`${article.title}: ${visual.alt}`} loading="lazy" decoding="async" /><figcaption>صورة مرتبطة بموضوع المقال من خدمات الإشراقة</figcaption></figure>}</>;
}
