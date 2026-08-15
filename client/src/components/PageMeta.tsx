import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
  keywords: string[];
  path: string;
  image?: string;
  imageAlt?: string;
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

export default function PageMeta({ title, description, keywords, path, image, imageAlt }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | شركة الإشراقة`;
    const canonicalUrl = `https://al-eshraqa.co${path}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords.join(", "));
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:locale", "ar_SA");
    const shareImage = image ?? "https://al-eshraqa.co/manus-storage/ishraqa-blue-mark_51e1bd1d.png";
    setMeta("property", "og:image", shareImage);
    setMeta("property", "og:image:alt", imageAlt ?? "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش");
    setMeta("name", "twitter:image", shareImage);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "robots", "index, follow, max-image-preview:large");
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, image, imageAlt, keywords, path, title]);

  return null;
}
