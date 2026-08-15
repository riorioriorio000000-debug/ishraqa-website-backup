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
    datePublished: article.publishedAt ?? "2026-08-14T00:00:00+03:00",
    dateModified: article.updatedAt ?? article.publishedAt ?? "2026-08-14T00:00:00+03:00",
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />;
}
