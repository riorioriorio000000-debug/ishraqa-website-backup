import { useEffect } from "react";

type PageMetaProps = {
  title: string;
  description: string;
  keywords: string[];
  path: string;
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

export default function PageMeta({ title, description, keywords, path }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = `${title} | شركة الإشراقة`;
    const canonicalUrl = `https://al-eshraqa.co${path}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords.join(", "));
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, keywords, path, title]);

  return null;
}
