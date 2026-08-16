import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { pathToFileURL } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import superjson from "superjson";
import type { SsrHeadMeta } from "../../client/src/ssr/meta";

const canonicalOrigin = "https://al-eshraqa.co";

type SsrRenderer = { render: (url: string) => Promise<{ html: string; dehydratedState: unknown; head: SsrHeadMeta }> };

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function absoluteUrl(value: string) {
  return value.startsWith("http") ? value : `${canonicalOrigin}${value}`;
}

function buildHead(meta: SsrHeadMeta) {
  const canonical = `${canonicalOrigin}${meta.canonicalPath}`;
  const image = absoluteUrl(meta.image ?? "/manus-storage/ishraqa-user-logo_64a160a3.png");
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
  const keywords = meta.keywords.join(", ");
  return `<title>${escapeHtml(meta.title)}</title><meta name="description" content="${escapeHtml(meta.description)}" />${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}<meta name="robots" content="${robots}" /><link rel="canonical" href="${escapeHtml(canonical)}" /><meta property="og:locale" content="ar_SA" /><meta property="og:type" content="${meta.ogType ?? "website"}" /><meta property="og:title" content="${escapeHtml(meta.title)}" /><meta property="og:description" content="${escapeHtml(meta.description)}" /><meta property="og:url" content="${escapeHtml(canonical)}" /><meta property="og:site_name" content="الإشراقة" /><meta property="og:image" content="${escapeHtml(image)}" /><meta property="og:image:alt" content="${escapeHtml(meta.imageAlt ?? "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش")}" /><meta name="twitter:card" content="${meta.image ? "summary_large_image" : "summary"}" /><meta name="twitter:title" content="${escapeHtml(meta.title)}" /><meta name="twitter:description" content="${escapeHtml(meta.description)}" /><meta name="twitter:image" content="${escapeHtml(image)}" />`;
}

function composeHtml(template: string, rendered: { html: string; dehydratedState: unknown; head: SsrHeadMeta }) {
  const state = JSON.stringify(superjson.serialize(rendered.dehydratedState)).replace(/</g, "\\u003c");
  return template.replace("<!--app-head-->", () => `${buildHead(rendered.head)}<script>window.__RQ_STATE__=${state}</script>`).replace("<!--app-html-->", () => rendered.html);
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
