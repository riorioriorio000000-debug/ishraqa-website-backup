import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const MAX_PAGE_BYTES = 900_000;
const MAX_EXTRACTED_CHARS = 12_000;

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }

  const normalized = address.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

async function validatePublicUrl(candidate: URL) {
  if (!['http:', 'https:'].includes(candidate.protocol)) {
    throw new Error("يُسمح بروابط HTTP وHTTPS العامة فقط.");
  }
  if (candidate.username || candidate.password) {
    throw new Error("لا يُسمح بروابط تحتوي على بيانات دخول.");
  }
  if (candidate.port && candidate.port !== '80' && candidate.port !== '443') {
    throw new Error("يُسمح بمنافذ الويب المعتادة فقط.");
  }
  const hostname = candidate.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    throw new Error("لا يمكن فتح عنوان محلي.");
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("الرابط لا يشير إلى خادم ويب عام مسموح.");
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function extractText(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()) : 'صفحة ويب';
  const text = decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
  return { title: title.slice(0, 180), text: text.slice(0, MAX_EXTRACTED_CHARS) };
}

export async function fetchPublicPageText(inputUrl: string) {
  let current = new URL(inputUrl);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await validatePublicUrl(current);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': 'IshraqaSiteAssistant/1.0 (+https://al-eshraqa.co)',
          accept: 'text/html, text/plain;q=0.9',
        },
      });
      const location = response.headers.get('location');
      if (response.status >= 300 && response.status < 400 && location) {
        current = new URL(location, current);
        continue;
      }
      if (!response.ok) {
        throw new Error(`تعذر قراءة الصفحة (HTTP ${response.status}).`);
      }
      const contentType = response.headers.get('content-type') ?? '';
      const length = Number(response.headers.get('content-length') ?? '0');
      if (!/text\/(html|plain)/i.test(contentType) || length > MAX_PAGE_BYTES) {
        throw new Error("يمكن تحليل صفحات HTML أو النصوص العامة ذات الحجم المناسب فقط.");
      }
      const body = (await response.text()).slice(0, MAX_PAGE_BYTES);
      const extracted = /text\/plain/i.test(contentType)
        ? { title: current.hostname, text: body.replace(/\s+/g, ' ').trim().slice(0, MAX_EXTRACTED_CHARS) }
        : extractText(body);
      if (!extracted.text) throw new Error("لم أجد نصًا عامًا كافيًا في الصفحة.");
      return { ...extracted, url: current.toString() };
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("تعذر إتمام إعادة التوجيه بطريقة آمنة.");
}
