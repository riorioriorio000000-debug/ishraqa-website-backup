import express, { type Express, type NextFunction, type Request, type Response } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { pathToFileURL } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import superjson from "superjson";
import { getLegacyArticleRedirectPath, getLegacyLocalServiceRedirectPath, getSitemapPaths, type SsrHeadMeta } from "../../client/src/ssr/meta";

const canonicalOrigin = "https://al-eshraqa.co";

type SsrRenderer = { render: (url: string) => Promise<{ html: string; dehydratedState: unknown; head: SsrHeadMeta }> };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function absoluteUrl(value: string) {
  return value.startsWith("http") ? value : `${canonicalOrigin}${value}`;
}

function escapeXml(value: string) {
  return escapeHtml(value);
}

export function buildSitemapXml(paths = getSitemapPaths()) {
  const urls = Array.from(new Set(paths)).map((entry) => `  <url><loc>${escapeXml(`${canonicalOrigin}${entry}`)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildStructuredData(meta: SsrHeadMeta) {
  const canonical = `${canonicalOrigin}${meta.canonicalPath}`;
  const organizationId = `${canonicalOrigin}/#organization`;
  const isAboutPage = meta.canonicalPath === "/about";
  const breadcrumbNode = meta.breadcrumbs && meta.breadcrumbs.length > 1 ? {
    "@type": "BreadcrumbList",
    itemListElement: meta.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } : undefined;
  const faqNode = meta.faq?.length ? {
    "@type": "FAQPage",
    mainEntity: meta.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  } : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${canonicalOrigin}/#website`,
        url: `${canonicalOrigin}/`,
        name: "شركة الإشراقة",
        alternateName: "الإشراقة",
        inLanguage: "ar-SA",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "شركة الإشراقة للخدمات المنزلية",
        alternateName: "شركة الإشراقة",
        url: `${canonicalOrigin}/`,
        logo: absoluteUrl("/manus-storage/ishraqa-user-logo_64a160a3.png"),
        telephone: "+966552610151",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+966552610151",
          contactType: "customer service",
          availableLanguage: "ar",
        },
        areaServed: {
          "@type": "Country",
          name: "المملكة العربية السعودية",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "خدمات الإشراقة المنزلية",
          itemListElement: [
            "تنظيف المنازل",
            "تنظيف الكنب والمفروشات",
            "تنظيف المكيفات",
            "صيانة المكيفات",
            "تنظيف الخزانات",
            "تنظيف المطابخ والأفران",
            "مكافحة الحشرات",
            "الصيانة المنزلية",
            "نقل العفش",
          ].map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        },
      },
      {
        "@type": isAboutPage ? ["WebPage", "AboutPage"] : "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: "ar-SA",
        isPartOf: { "@id": `${canonicalOrigin}/#website` },
        publisher: { "@id": organizationId },
        primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(meta.image ?? "/manus-storage/ishraqa-user-logo_64a160a3.png") },
        ...(isAboutPage ? { about: { "@id": organizationId } } : {}),
      },
      ...(meta.video ? [{
        "@type": "VideoObject",
        name: meta.video.name,
        description: meta.video.description,
        contentUrl: absoluteUrl(meta.video.contentUrl),
        thumbnailUrl: absoluteUrl(meta.image ?? "/manus-storage/ishraqa-user-logo_64a160a3.png"),
        uploadDate: meta.video.uploadDate,
        inLanguage: "ar-SA",
        publisher: { "@id": organizationId },
        mainEntityOfPage: { "@id": `${canonical}#webpage` },
      }] : []),
      ...(breadcrumbNode ? [breadcrumbNode] : []),
      ...(faqNode ? [faqNode] : []),
    ],
  };
}

function sendDynamicSitemap(_req: Request, res: Response) {
  res.status(200).set({ "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-cache" }).end(buildSitemapXml());
}

export function buildHead(meta: SsrHeadMeta) {
  const canonical = `${canonicalOrigin}${meta.canonicalPath}`;
  const image = absoluteUrl(meta.image ?? "/manus-storage/ishraqa-user-logo_64a160a3.png");
  const robots = meta.noindex ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large";
  const keywords = meta.keywords.join(", ");
  const structuredData = JSON.stringify(buildStructuredData(meta)).replace(/</g, "\\u003c");
  return `<title>${escapeHtml(meta.title)}</title><meta name="description" content="${escapeHtml(meta.description)}" />${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}<meta name="robots" content="${robots}" /><link rel="canonical" href="${escapeHtml(canonical)}" /><link rel="alternate" hreflang="ar-SA" href="${escapeHtml(canonical)}" /><meta property="og:locale" content="ar_SA" /><meta property="og:type" content="${meta.ogType ?? "website"}" /><meta property="og:title" content="${escapeHtml(meta.title)}" /><meta property="og:description" content="${escapeHtml(meta.description)}" /><meta property="og:url" content="${escapeHtml(canonical)}" /><meta property="og:site_name" content="شركة الإشراقة" /><meta property="og:image" content="${escapeHtml(image)}" /><meta property="og:image:alt" content="${escapeHtml(meta.imageAlt ?? "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش")}" /><meta name="twitter:card" content="${meta.image ? "summary_large_image" : "summary"}" /><meta name="twitter:title" content="${escapeHtml(meta.title)}" /><meta name="twitter:description" content="${escapeHtml(meta.description)}" /><meta name="twitter:image" content="${escapeHtml(image)}" /><script type="application/ld+json">${structuredData}</script>`;
}

export function composeHtml(template: string, rendered: { html: string; dehydratedState: unknown; head: SsrHeadMeta }) {
  const state = JSON.stringify(superjson.serialize(rendered.dehydratedState)).replace(/</g, "\\u003c");
  return template.replace("<!--app-head-->", () => `${buildHead(rendered.head)}<script>window.__RQ_STATE__=${state}</script>`).replace("<!--app-html-->", () => rendered.html);
}

export function getLegacyArticleRedirectTarget(pathname: string) {
  const legacySlug = pathname.match(/^\/(?:articles\/)?([^/]+)$/)?.[1];
  return legacySlug ? getLegacyArticleRedirectPath(legacySlug) : undefined;
}

export function getLegacyRedirectTarget(pathname: string) {
  return getLegacyArticleRedirectTarget(pathname) ?? getLegacyLocalServiceRedirectPath(pathname);
}

function redirectLegacyPath(req: Request, res: Response, next: NextFunction) {
  const redirectTarget = getLegacyRedirectTarget(req.path);
  if (!redirectTarget) return next();
  const queryStart = req.originalUrl.indexOf("?");
  const query = queryStart >= 0 ? req.originalUrl.slice(queryStart) : "";
  return res.redirect(301, `${redirectTarget}${query}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.get(["/articles/:legacySlug", "/:legacySlug"], redirectLegacyPath);
  app.get("/services/:serviceSlug/:citySlug", redirectLegacyPath);
  app.get("/sitemap.xml", sendDynamicSitemap);
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/entry-client.tsx"`, `src="/src/entry-client.tsx?v=${nanoid()}"`);
      template = await vite.transformIndexHtml(url, template);
      const renderer = await vite.ssrLoadModule("/src/entry-server.tsx") as SsrRenderer;
      const rendered = await renderer.render(url);
      res.status(rendered.head.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, rendered));
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.get("/index.html", (_req, res) => res.redirect(301, "/"));
  app.get(["/articles/:legacySlug", "/:legacySlug"], redirectLegacyPath);
  app.get("/services/:serviceSlug/:citySlug", redirectLegacyPath);
  app.get("/sitemap.xml", sendDynamicSitemap);
  app.use(express.static(distPath, { index: false, redirect: false }));
  app.use("*", async (req, res, next) => {
    try {
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const rendererPath = path.resolve(import.meta.dirname, "server", "entry-server.js");
      const renderer = await import(pathToFileURL(rendererPath).href) as SsrRenderer;
      const rendered = await renderer.render(req.originalUrl);
      res.status(rendered.head.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, rendered));
    } catch (error) {
      next(error);
    }
  });
}
