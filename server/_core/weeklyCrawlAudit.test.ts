import { describe, expect, it } from "vitest";
import { runWeeklyCrawlAudit } from "./weeklyCrawlAudit";

function response(status: number, body = "") {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  };
}

const origin = "https://example.test";
const sitemap = `<?xml version="1.0"?><urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/about</loc></url></urlset>`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml`;
const homepage = `<html><head><title>الرئيسية</title><link rel="canonical" href="${origin}/"></head></html>`;
const about = `<html><head><title>عنّا</title><link rel="canonical" href="${origin}/about"></head></html>`;

describe("runWeeklyCrawlAudit", () => {
  it("يفحص الروابط والبيانات الوصفية وملف robots دون ملاحظات عندما تكون سليمة", async () => {
    const fetchFn = async (url: string, init?: RequestInit) => {
      if (url.endsWith("/sitemap.xml")) return response(200, sitemap);
      if (url.endsWith("/robots.txt")) return response(200, robots);
      if (init?.method === "HEAD") return response(200);
      return response(200, url.endsWith("/about") ? about : homepage);
    };

    await expect(runWeeklyCrawlAudit({ origin, fetchFn })).resolves.toMatchObject({
      sitemapUrlCount: 2,
      http: { ok: 2, failed: 0 },
      metadata: { checked: 2, passed: 2, failed: 0 },
      robots: { status: 200, declaresSitemap: true },
      issues: [],
    });
  });

  it("يسجل مشكلة الصفحة والبيانات الوصفية دون جعل تقرير المهمة يفقد بقية النتائج", async () => {
    const fetchFn = async (url: string, init?: RequestInit) => {
      if (url.endsWith("/sitemap.xml")) return response(200, sitemap);
      if (url.endsWith("/robots.txt")) return response(200, "User-agent: *");
      if (init?.method === "HEAD") return response(url.endsWith("/about") ? 503 : 200);
      return response(200, url.endsWith("/about") ? "<html><head><title>عنّا</title></head></html>" : homepage);
    };

    const report = await runWeeklyCrawlAudit({ origin, fetchFn });
    expect(report.http).toEqual({ ok: 1, failed: 1 });
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "robots" }),
        expect.objectContaining({ url: `${origin}/about`, check: "http", detail: "HTTP 503" }),
        expect.objectContaining({ url: `${origin}/about`, check: "metadata", detail: "canonical" }),
      ])
    );
  });
});
