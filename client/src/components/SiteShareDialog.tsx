import { Check, Copy, Link2, Mail, MessageCircle, Music2, Send, Share2 } from "lucide-react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const OFFICIAL_ORIGIN = "https://al-eshraqa.co";

export type ShareRequest = {
  title?: string;
  text?: string;
  url?: string;
};

type ResolvedShareRequest = Required<ShareRequest>;

type SiteShareContextValue = {
  openShare: (request?: ShareRequest) => void;
};

const SiteShareContext = createContext<SiteShareContextValue>({ openShare: () => undefined });

export function getOfficialShareUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    const url = new URL(pathOrUrl);
    return `${OFFICIAL_ORIGIN}${url.pathname}${url.search}${url.hash}`;
  }
  return `${OFFICIAL_ORIGIN}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildPlatformShareUrl(platform: "whatsapp" | "facebook" | "x" | "telegram", request: ResolvedShareRequest) {
  const message = `${request.text}\n${request.url}`.trim();
  if (platform === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(message)}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(request.url)}`;
  if (platform === "x") return `https://x.com/intent/post?text=${encodeURIComponent(request.text)}&url=${encodeURIComponent(request.url)}`;
  return `https://t.me/share/url?url=${encodeURIComponent(request.url)}&text=${encodeURIComponent(request.text)}`;
}

export function buildEmailShareUrl(request: ResolvedShareRequest) {
  const subject = `مشاركة صفحة: ${request.title}`;
  const body = `${request.text}\n\nرابط الصفحة: ${request.url}\n\nمع تحيات شركة الإشراقة للخدمات المنزلية.`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function ShareDialog({ request, open, onOpenChange }: { request: ResolvedShareRequest; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [copied, setCopied] = useState(false);
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(request.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("انسخ الرابط من هنا:", request.url);
    }
  }, [request.url]);

  const nativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: request.title, text: request.text, url: request.url });
        return;
      } catch {
        return;
      }
    }
    await copyLink();
  }, [copyLink, request]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="site-share-dialog" dir="rtl" aria-describedby="site-share-description">
        <DialogHeader className="site-share-heading">
          <span className="site-share-dialog-icon" aria-hidden="true"><Share2 size={22} /></span>
          <DialogTitle>مشاركة الصفحة</DialogTitle>
          <DialogDescription id="site-share-description">اختر التطبيق الذي يناسبك لمشاركة الرابط.</DialogDescription>
        </DialogHeader>
        <div className="site-share-apps" aria-label="خيارات المشاركة">
          <a className="site-share-app site-share-whatsapp" href={buildPlatformShareUrl("whatsapp", request)} target="_blank" rel="noreferrer"><MessageCircle size={21} aria-hidden="true" /><span>واتساب</span></a>
          <a className="site-share-app site-share-facebook" href={buildPlatformShareUrl("facebook", request)} target="_blank" rel="noreferrer"><strong aria-hidden="true">f</strong><span>فيسبوك</span></a>
          <a className="site-share-app site-share-x" href={buildPlatformShareUrl("x", request)} target="_blank" rel="noreferrer"><strong aria-hidden="true">𝕏</strong><span>X</span></a>
          <a className="site-share-app site-share-telegram" href={buildPlatformShareUrl("telegram", request)} target="_blank" rel="noreferrer"><Send size={20} aria-hidden="true" /><span>تيليغرام</span></a>
          <a className="site-share-app site-share-email" href={buildEmailShareUrl(request)}><Mail size={20} aria-hidden="true" /><span>البريد الإلكتروني</span></a>
          <button className="site-share-app site-share-tiktok" type="button" onClick={nativeShare}><Music2 size={20} aria-hidden="true" /><span>تيك توك</span><small>قائمة الجهاز</small></button>
          <button className="site-share-app site-share-copy" type="button" onClick={copyLink}>{copied ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}<span>{copied ? "تم النسخ" : "نسخ الرابط"}</span></button>
        </div>
        <p className="site-share-note"><Link2 size={15} aria-hidden="true" /> يفتح خيار تيك توك قائمة المشاركة الأصلية في جهازك أو ينسخ الرابط؛ لا يوفر تيك توك رابط مشاركة ويب مباشرًا للمنشورات.</p>
      </DialogContent>
    </Dialog>
  );
}

export function SiteShareProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<ResolvedShareRequest>({ title: "شركة الاشراقة للخدمات المنزلية", text: "تعرف على خدمات الإشراقة المنزلية.", url: OFFICIAL_ORIGIN });

  const openShare = useCallback((next: ShareRequest = {}) => {
    const title = next.title ?? (typeof document === "undefined" ? "شركة الاشراقة للخدمات المنزلية" : document.title);
    setRequest({ title, text: next.text ?? `شارك صفحة «${title}» من شركة الإشراقة.`, url: getOfficialShareUrl(next.url ?? location) });
    setOpen(true);
  }, [location]);

  const value = useMemo(() => ({ openShare }), [openShare]);
  return <SiteShareContext.Provider value={value}>{children}<ShareDialog open={open} onOpenChange={setOpen} request={request} /></SiteShareContext.Provider>;
}

export function useSiteShare() {
  return useContext(SiteShareContext);
}
