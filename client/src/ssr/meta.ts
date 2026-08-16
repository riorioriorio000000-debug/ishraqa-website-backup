import { articleEntries } from "@/pages/ArticleDetail";

export type SsrHeadMeta = {
  title: string;
  description: string;
  keywords: readonly string[];
  canonicalPath: string;
  image?: string;
  imageAlt?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  notFound?: boolean;
};

const defaultImage = "/manus-storage/ishraqa-user-logo_64a160a3.png";
const homeImage = "/manus-storage/ishraqa-home-open-graph_7b7b6db0.jpg";

const publicPages: Record<string, Omit<SsrHeadMeta, "canonicalPath">> = {
  "/": {
    title: "شركة تنظيف وصيانة في السعودية | شركة الإشراقة",
    description: "شركة الإشراقة لخدمات تنظيف المنازل وصيانة المكيفات ونقل العفش في مدن السعودية. اختر الخدمة المناسبة لمدينتك وتابع التنسيق عبر واتساب.",
    keywords: ["شركة تنظيف في السعودية", "شركة صيانة في السعودية", "تنظيف منازل", "صيانة مكيفات", "نقل عفش", "شركة تنظيف في الخرج", "خدمات منزلية"],
    image: homeImage,
    imageAlt: "تكوين توضيحي لخدمات تنظيف وصيانة ونقل عفش من الإشراقة",
  },
  "/services": { title: "الخدمات | شركة الإشراقة", description: "استكشف خدمات تنظيف المنازل والصيانة المنزلية ونقل العفش من الإشراقة، واختر نقطة البداية الأقرب لاحتياجك.", keywords: ["خدمات تنظيف", "صيانة منزلية", "نقل عفش", "شركة الإشراقة"] },
  "/booking": { title: "الحجز | شركة الإشراقة", description: "أرسل تفاصيل خدمة التنظيف أو الصيانة أو نقل العفش، ثم تابع التنسيق مع الإشراقة عبر واتساب.", keywords: ["حجز تنظيف", "حجز صيانة", "حجز نقل عفش"] },
  "/calculator": { title: "الحاسبة التقديرية | شركة الإشراقة", description: "نموذج تقديري يساعدك على ترتيب تفاصيل خدمة التنظيف أو الصيانة قبل التواصل مع فريق الإشراقة.", keywords: ["حاسبة تنظيف", "تقدير خدمة صيانة", "خدمات منزلية"] },
  "/articles": { title: "المقالات | شركة الإشراقة", description: "أدلة عملية عن التنظيف والصيانة ونقل العفش، مع موضوعات محلية تساعدك على ترتيب طلب الخدمة في المدن السعودية.", keywords: ["مقالات تنظيف", "دليل صيانة", "نقل عفش", "تنظيف السعودية"] },
  "/where-we-work": { title: "نطاق الخدمة | شركة الإشراقة", description: "تعرّف إلى المدن والمناطق التي تنسق فيها الإشراقة خدمات التنظيف والصيانة ونقل العفش داخل السعودية.", keywords: ["شركة تنظيف السعودية", "مدن خدمة التنظيف", "نطاق الخدمة"] },
  "/about": { title: "عنّا | شركة الإشراقة", description: "تعرّف إلى طريقة الإشراقة في تنسيق خدمات التنظيف والصيانة ونقل العفش بوضوح واهتمام بالتفاصيل.", keywords: ["عن شركة الإشراقة", "تنظيف وصيانة", "نقل عفش"] },
  "/faq": { title: "الأسئلة الشائعة | شركة الإشراقة", description: "إجابات مختصرة عن خدمات التنظيف والصيانة ونقل العفش وكيفية التنسيق عبر واتساب مع الإشراقة.", keywords: ["أسئلة تنظيف", "أسئلة صيانة", "نقل عفش"] },
  "/customer-service": { title: "خدمة العملاء | شركة الإشراقة", description: "اسأل مساعد الإشراقة عن خدمات التنظيف والصيانة والمقالات، ثم انتقل إلى صفحة الخدمة المناسبة عند الحاجة.", keywords: ["خدمة عملاء تنظيف", "مساعد تنظيف", "شركة الإشراقة"] },
  "/privacy": { title: "سياسة الخصوصية | شركة الإشراقة", description: "سياسة الخصوصية الخاصة بموقع الإشراقة لخدمات التنظيف والصيانة ونقل العفش.", keywords: ["سياسة الخصوصية", "شركة الإشراقة"] },
};

const privatePages: Record<string, Omit<SsrHeadMeta, "canonicalPath">> = {
  "/notifications": { title: "الإشعارات | شركة الإشراقة", description: "مركز إشعارات الزائر في موقع الإشراقة.", keywords: [], noindex: true },
  "/notification-preferences": { title: "تفضيلات الإشعارات | شركة الإشراقة", description: "تفضيلات إشعارات الزائر في موقع الإشراقة.", keywords: [], noindex: true },
};

export function getSsrHeadMeta(url: string): SsrHeadMeta {
  const path = decodeURI(url.split("?")[0] || "/").replace(/\/$/, "") || "/";
  const articleSlug = path.match(/^\/articles\/([^/]+)$/)?.[1];
  if (articleSlug) {
    const article = articleEntries.find((entry) => entry.slug === articleSlug);
    if (article) {
      return {
        title: `${article.title} | شركة الإشراقة`,
        description: article.intro,
        keywords: [...article.keywords, "شركة الإشراقة"],
        canonicalPath: `/articles/${article.slug}`,
        image: article.shareImage,
        imageAlt: `بطاقة مشاركة لمقال ${article.title}`,
        ogType: "article",
      };
    }
  }
  const page = publicPages[path] ?? privatePages[path];
  if (page) return { ...page, canonicalPath: path, image: page.image ?? defaultImage, imageAlt: page.imageAlt ?? "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش" };
  return {
    title: "الصفحة غير متاحة | شركة الإشراقة",
    description: "الصفحة المطلوبة غير متاحة. يمكنك العودة إلى الصفحة الرئيسية لموقع الإشراقة.",
    keywords: [],
    canonicalPath: path,
    image: defaultImage,
    imageAlt: "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش",
    noindex: true,
    notFound: true,
  };
}
