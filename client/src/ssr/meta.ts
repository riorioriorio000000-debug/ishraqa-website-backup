import { articleEntries, resolveLegacyArticleSlug } from "@/pages/ArticleDetail";
import { getLocalServicePage, getLocalServicePagePath, localServicePages, resolveLocalServiceSlug } from "@/data/localServicePages";

export type SsrBreadcrumb = { name: string; path: string };
export type SsrFaq = { question: string; answer: string };

export type SsrHeadMeta = {
  title: string;
  description: string;
  keywords: readonly string[];
  canonicalPath: string;
  image?: string;
  imageAlt?: string;
  ogType?: "website" | "article";
  video?: { name: string; description: string; contentUrl: string; uploadDate: string };
  breadcrumbs?: readonly SsrBreadcrumb[];
  faq?: readonly SsrFaq[];
  noindex?: boolean;
  notFound?: boolean;
};

const defaultImage = "/manus-storage/ishraqa-user-logo_64a160a3.png";
const homeImage = "/manus-storage/ishraqa-home-open-graph_7b7b6db0.jpg";

const publicPages: Record<string, Omit<SsrHeadMeta, "canonicalPath">> = {
  "/": {
    title: "شركة الاشراقة | للخدمات المنزلية في السعودية",
    description: "شركة الإشراقة للخدمات المنزلية في السعودية: تنظيف المنازل والأثاث، صيانة المكيفات، مكافحة الحشرات، تنسيق الحدائق، ونقل العفش.",
    keywords: ["شركة تنظيف في السعودية", "شركة صيانة في السعودية", "تنظيف منازل", "صيانة مكيفات", "نقل عفش", "شركة تنظيف في الخرج", "خدمات منزلية"],
    image: homeImage,
    imageAlt: "تكوين توضيحي لخدمات تنظيف وصيانة ونقل عفش من الإشراقة",
    video: { name: "تنظيف الكنب والمجالس من واقع أعمال الإشراقة", description: "مقطع حقيقي من خدمة تنظيف كنب منزلي يوضح العناية بالتفاصيل قبل الانتهاء.", contentUrl: "/manus-storage/ishraqa-upholstery-work-01_c6221152.mp4", uploadDate: "2026-08-18" },
  },
  "/services": { title: "الخدمات | شركة الإشراقة", description: "استكشف خدمات التنظيف والصيانة ونقل العفش من الإشراقة، وشاهد لقطات قصيرة من أعمال تنظيف الكنب والأفران.", keywords: ["خدمات تنظيف", "تنظيف كنب", "تنظيف أفران", "صيانة منزلية", "نقل عفش", "شركة الإشراقة"], video: { name: "العناية بأفران الغاز من واقع أعمال الإشراقة", description: "مقطع حقيقي من عمل عناية وتنظيف فرن غاز ضمن تجهيزات المطبخ المنزلية.", contentUrl: "/manus-storage/ishraqa-oven-work-01_28be488e.mp4", uploadDate: "2026-08-18" } },
  "/our-work": { title: "أعمالنا | شركة الإشراقة", description: "شاهد مقاطع قصيرة من أعمال الإشراقة الحقيقية في تنظيف الكنب والمفروشات والأفران والتكييف والخزانات المنزلية.", keywords: ["أعمال تنظيف كنب", "تنظيف مفروشات", "تنظيف أفران الغاز", "صيانة تكييف", "تنظيف خزانات", "شركة الإشراقة", "خدمات منزلية"], video: { name: "فحص وحدة تكييف من واقع العمل", description: "مقطع حقيقي قصير يوضح سياق فحص وحدة تكييف منزلية وتجهيز منطقة العمل دون إظهار أشخاص.", contentUrl: "/manus-storage/ishraqa-ac-work_9f225e58.mp4", uploadDate: "2026-08-19" } },
  "/booking": { title: "الحجز | شركة الإشراقة", description: "أرسل تفاصيل خدمة التنظيف أو الصيانة أو نقل العفش، ثم تابع التنسيق مع الإشراقة عبر واتساب.", keywords: ["حجز تنظيف", "حجز صيانة", "حجز نقل عفش"] },
  "/calculator": { title: "الحاسبة التقديرية | شركة الإشراقة", description: "نموذج تقديري يساعدك على ترتيب تفاصيل خدمة التنظيف أو الصيانة قبل التواصل مع فريق الإشراقة.", keywords: ["حاسبة تنظيف", "تقدير خدمة صيانة", "خدمات منزلية"] },
  "/articles": { title: "المقالات | شركة الإشراقة", description: "أدلة عملية عن التنظيف والصيانة ونقل العفش، مع موضوعات محلية تساعدك على ترتيب طلب الخدمة في المدن السعودية.", keywords: ["مقالات تنظيف", "دليل صيانة", "نقل عفش", "تنظيف السعودية"] },
  "/where-we-work": { title: "نطاق الخدمة | شركة الإشراقة", description: "تعرّف إلى المدن والمناطق التي تنسق فيها الإشراقة خدمات التنظيف والصيانة ونقل العفش داخل السعودية.", keywords: ["شركة تنظيف السعودية", "مدن خدمة التنظيف", "نطاق الخدمة"] },
  "/about": { title: "من نحن | شركة الإشراقة للخدمات المنزلية", description: "تعرّف إلى شركة الإشراقة للخدمات المنزلية في السعودية وخدمات تنظيف المنازل وصيانة المكيفات ونقل العفش، وابدأ طلبك عبر واتساب.", keywords: ["من نحن", "شركة الإشراقة للخدمات المنزلية", "شركة تنظيف وصيانة", "نقل عفش", "تنظيف منازل السعودية"] },
  "/faq": { title: "الأسئلة الشائعة | شركة الإشراقة", description: "إجابات مختصرة عن خدمات التنظيف والصيانة ونقل العفش وكيفية التنسيق عبر واتساب مع الإشراقة.", keywords: ["أسئلة تنظيف", "أسئلة صيانة", "نقل عفش"] },
  "/customer-service": { title: "خدمة العملاء | شركة الإشراقة", description: "اسأل مساعد الإشراقة عن خدمات التنظيف والصيانة والمقالات، ثم انتقل إلى صفحة الخدمة المناسبة عند الحاجة.", keywords: ["خدمة عملاء تنظيف", "مساعد تنظيف", "شركة الإشراقة"] },
  "/privacy": { title: "سياسة الخصوصية | شركة الإشراقة", description: "سياسة الخصوصية الخاصة بموقع الإشراقة لخدمات التنظيف والصيانة ونقل العفش.", keywords: ["سياسة الخصوصية", "شركة الإشراقة"] },
};

const privatePages: Record<string, Omit<SsrHeadMeta, "canonicalPath">> = {
  "/notifications": { title: "الإشعارات | شركة الإشراقة", description: "مركز إشعارات الزائر في موقع الإشراقة.", keywords: [], noindex: true },
  "/notification-preferences": { title: "تفضيلات الإشعارات | شركة الإشراقة", description: "تفضيلات إشعارات الزائر في موقع الإشراقة.", keywords: [], noindex: true },
};

export function getSitemapPaths(): readonly string[] {
  return [...Object.keys(publicPages), ...articleEntries.map((article) => `/articles/${article.slug}`), ...localServicePages.map((page) => getLocalServicePagePath(page.serviceSlug, page.citySlug))];
}

export function getLegacyArticleRedirectPath(articleSlug: string) {
  const canonicalSlug = resolveLegacyArticleSlug(articleSlug);
  const article = articleEntries.find((entry) => entry.slug === canonicalSlug);
  return article && article.slug !== articleSlug ? `/articles/${article.slug}` : undefined;
}

export function getLegacyLocalServiceRedirectPath(pathname: string) {
  const match = pathname.match(/^\/services\/([^/]+)\/([^/]+)$/);
  if (!match) return undefined;
  const [, serviceSlug, citySlug] = match;
  const canonicalServiceSlug = resolveLocalServiceSlug(serviceSlug);
  const page = getLocalServicePage(canonicalServiceSlug, citySlug);
  return page && canonicalServiceSlug !== serviceSlug ? getLocalServicePagePath(page.serviceSlug, page.citySlug) : undefined;
}

export function getSsrHeadMeta(url: string): SsrHeadMeta {
  const path = decodeURI(url.split("?")[0] || "/").replace(/\/$/, "") || "/";
  const articleSlug = path.match(/^\/articles\/([^/]+)$/)?.[1];
  if (articleSlug) {
    const article = articleEntries.find((entry) => entry.slug === resolveLegacyArticleSlug(articleSlug));
    if (article) {
      return {
        title: `${article.title} | شركة الإشراقة`,
        description: article.intro,
        keywords: [...article.keywords, "شركة الإشراقة"],
        canonicalPath: `/articles/${article.slug}`,
        image: article.shareImage,
        imageAlt: `بطاقة مشاركة لمقال ${article.title}`,
        ogType: "article",
        breadcrumbs: [{ name: "الرئيسية", path: "/" }, { name: "المقالات", path: "/articles" }, { name: article.title, path: `/articles/${article.slug}` }],
        ...(article.serviceVideo ? { video: { name: article.serviceVideo.title, description: article.serviceVideo.description, contentUrl: article.serviceVideo.src, uploadDate: "2026-08-18" } } : {}),
      };
    }
  }
  const serviceMatch = path.match(/^\/services\/([^/]+)\/([^/]+)$/);
  if (serviceMatch) {
    const page = getLocalServicePage(serviceMatch[1], serviceMatch[2]);
    if (page) {
      const canonicalPath = getLocalServicePagePath(page.serviceSlug, page.citySlug);
      return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        canonicalPath,
        image: page.image,
        imageAlt: `صورة مشاركة لخدمة ${page.serviceName} في ${page.cityName}`,
        ogType: "article",
        breadcrumbs: [{ name: "الرئيسية", path: "/" }, { name: "الخدمات", path: "/services" }, { name: `${page.serviceName} في ${page.cityName}`, path: canonicalPath }],
        faq: page.faq,
      };
    }
  }
  const page = publicPages[path] ?? privatePages[path];
  if (page) {
    const pageLabel = page.title.split(" | ")[0] ?? page.title;
    return {
      ...page,
      canonicalPath: path,
      image: page.image ?? defaultImage,
      imageAlt: page.imageAlt ?? "شعار شركة الإشراقة للتنظيف والصيانة ونقل العفش",
      ...(path === "/" ? {} : { breadcrumbs: [{ name: "الرئيسية", path: "/" }, { name: pageLabel, path }] }),
    };
  }
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
