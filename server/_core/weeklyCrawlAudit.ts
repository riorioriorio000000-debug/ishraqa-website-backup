import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { sdk } from "./sdk";

const OFFICIAL_ORIGIN = "https://al-eshraqa.co";
const MAX_SITEMAP_URLS = 500;
const HTTP_CONCURRENCY = 10;
const METADATA_SAMPLE_SIZE = 8;

type FetchResponse = {
  ok: boolean;
  status: number;
  text(): Promise<string>;
};
type FetchLike = (url: string, init?: RequestInit) => Promise<FetchResponse>;

export type CrawlAuditIssue = {
  url: string;
  check: "http" | "metadata" | "sitemap" | "robots";
  detail: string;
};

export type CrawlAuditResult = {
  checkedAt: string;
  origin: string;
  sitemapUrl: string;
  sitemapUrlCount: number;
  http: { ok: number; failed: number };
  metadata: { checked: number; passed: number; failed: number };
  robots: { status: number; declaresSitemap: boolean };
  issues: CrawlAuditIssue[];
};

function extractSitemapUrls(xml: string, origin: string): string[] {
  const matches = Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi));
  const urls = matches.map(match => match[1].trim());
  const expectedOrigin = new URL(origin).origin;

  const legalUrls = urls.filter(url => {
    try {
      return new URL(url).origin === expectedOrigin;
    } catch {
      return false;
    }
  });

  return Array.from(new Set(legalUrls));
}

function extractCanonical(html: string): string | null {
  const canonicalTag = html.match(/<link\b[^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i)?.[0];
  return canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null;
}

function hasNoindex(html: string): boolean {
  const robotsTag = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0] ?? "";
  const content = robotsTag.match(/\bcontent=["']([^"']+)["']/i)?.[1] ?? "";
  return /\bnoindex\b/i.test(content);
}

function hasTitle(html: string): boolean {
  return /<title\b[^>]*>\s*[^<]+\s*<\/title>/i.test(html);
}

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  worker: (value: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(values.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const current = cursor++;
      results[current] = await worker(values[current]);
    }
  });

  await Promise.all(runners);
  return results;
}

function fetchWithTimeout(fetchFn: FetchLike, url: string, init: RequestInit): Promise<FetchResponse> {
  return fetchFn(url, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
  });
}

export async function runWeeklyCrawlAudit(options: {
  origin?: string;
  fetchFn?: FetchLike;
} = {}): Promise<CrawlAuditResult> {
  const origin = (options.origin ?? OFFICIAL_ORIGIN).replace(/\/$/, "");
  const fetchFn = options.fetchFn ?? (globalThis.fetch as FetchLike);
  const sitemapUrl = `${origin}/sitemap.xml`;
  const issues: CrawlAuditIssue[] = [];

  const sitemapResponse = await fetchWithTimeout(fetchFn, sitemapUrl, { method: "GET" });
  if (!sitemapResponse.ok) {
    throw new Error(`Unable to load sitemap: HTTP ${sitemapResponse.status}`);
  }

  const urls = extractSitemapUrls(await sitemapResponse.text(), origin);
  if (urls.length === 0) {
    throw new Error("Sitemap contains no legal URLs for the official origin");
  }
  if (urls.length > MAX_SITEMAP_URLS) {
    throw new Error(`Sitemap exceeds the safety limit of ${MAX_SITEMAP_URLS} URLs`);
  }

  const robotsResponse = await fetchWithTimeout(fetchFn, `${origin}/robots.txt`, { method: "GET" });
  const robotsText = robotsResponse.ok ? await robotsResponse.text() : "";
  const declaresSitemap = robotsText.includes(sitemapUrl);
  if (!robotsResponse.ok) {
    issues.push({ url: `${origin}/robots.txt`, check: "robots", detail: `HTTP ${robotsResponse.status}` });
  } else if (!declaresSitemap) {
    issues.push({ url: `${origin}/robots.txt`, check: "robots", detail: "Sitemap declaration is missing" });
  }

  const httpResults = await mapWithConcurrency(urls, HTTP_CONCURRENCY, async url => {
    try {
      const response = await fetchWithTimeout(fetchFn, url, { method: "HEAD" });
      if (response.status !== 200) {
        issues.push({ url, check: "http", detail: `HTTP ${response.status}` });
        return false;
      }
      return true;
    } catch (error) {
      issues.push({ url, check: "http", detail: error instanceof Error ? error.message : "Request failed" });
      return false;
    }
  });

  const metadataUrls = urls.slice(0, METADATA_SAMPLE_SIZE);
  const metadataResults = await mapWithConcurrency(metadataUrls, 4, async url => {
    try {
      const response = await fetchWithTimeout(fetchFn, url, { method: "GET" });
      if (!response.ok) {
        issues.push({ url, check: "metadata", detail: `Unable to fetch HTML: HTTP ${response.status}` });
        return false;
      }

      const html = await response.text();
      const canonical = extractCanonical(html);
      const expectedCanonical = new URL(url).toString();
      const missing = [
        !hasTitle(html) ? "title" : "",
        !canonical ? "canonical" : "",
        canonical && canonical !== expectedCanonical ? "canonical mismatch" : "",
        hasNoindex(html) ? "noindex" : "",
      ].filter(Boolean);

      if (missing.length > 0) {
        issues.push({ url, check: "metadata", detail: missing.join(", ") });
        return false;
      }
      return true;
    } catch (error) {
      issues.push({ url, check: "metadata", detail: error instanceof Error ? error.message : "Request failed" });
      return false;
    }
  });

  return {
    checkedAt: new Date().toISOString(),
    origin,
    sitemapUrl,
    sitemapUrlCount: urls.length,
    http: { ok: httpResults.filter(Boolean).length, failed: httpResults.filter(result => !result).length },
    metadata: {
      checked: metadataUrls.length,
      passed: metadataResults.filter(Boolean).length,
      failed: metadataResults.filter(result => !result).length,
    },
    robots: { status: robotsResponse.status, declaresSitemap },
    issues,
  };
}

export async function weeklyCrawlAuditHandler(req: ExpressRequest, res: ExpressResponse): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "cron-only" });
      return;
    }

    const report = await runWeeklyCrawlAudit();
    console.info("[weekly-crawl-audit]", JSON.stringify({ taskUid: user.taskUid, ...report }));
    res.status(200).json({ ok: report.issues.length === 0, taskUid: user.taskUid, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown crawl audit failure";
    console.error("[weekly-crawl-audit]", error);
    res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
