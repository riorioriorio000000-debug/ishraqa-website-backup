import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
  keywords: string[];
  path: string;
  image?: string;
  imageAlt?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
};

const conciseTitlesByPath: Record<string, string> = {
  "/about": "من نحن | شركة الإشراقة للخدمات المنزلية",
  "/services": "الخدمات",
  "/our-work": "أعمالنا",
  "/calculator": "الحاسبة التقديرية",
  "/booking": "الحجز",
  "/articles": "المقالات",
  "/where-we-work": "نطاق الخدمة",
  "/faq": "الأسئلة الشائعة",
  "/customer-service": "خدمة العملاء",
};

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function PageMeta({ title, description, keywords, path, image, imageAlt, ogType = "website", noindex = false }: PageMetaProps) {
  useEffect(() => {
    const pageTitle = conciseTitlesByPath[path] ?? title;
    const fullTitle = path === "/" || pageTitle.includes("شركة الإشراقة") ? pageTitle : `${pageTitle} | شركة الإشراقة`;
    const canonicalUrl = `https://al-eshraqa.co${path}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords.join(", "));
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:locale", "ar_SA");
    const shareImage = image ?? "https://al-eshraqa.co/media/brand.png";
    setMeta("property", "og:image", shareImage);
    setMeta("property", "og:image:alt", imageAlt ?? "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش");
    setMeta("name", "twitter:image", shareImage);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, image, imageAlt, keywords, noindex, ogType, path, title]);

  return null;
}
