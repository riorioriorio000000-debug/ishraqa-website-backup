export type SiteContentCard = {
  id: string;
  kind: "service" | "article" | "video" | "booking";
  title: string;
  description: string;
  href: string;
  image?: string;
  video?: string;
};

export const siteKnowledge = `
معلومات موقع شركة الإشراقة للتنظيف والصيانة ونقل العفش:
- الهاتف وواتساب: 0552610151، ورابط واتساب الصحيح هو https://wa.me/966552610151.
- الخدمات: تنظيف المنازل، الصيانة المنزلية، ونقل العفش.
- التغطية: الرياض، جدة، مكة المكرمة، المدينة المنورة، الدمام، الخبر، الطائف، أبها، تبوك، القصيم، جازان، ومدن أخرى بعد التأكيد.
- الحجز: يمكن للزائر اختيار المدينة والخدمة والتاريخ والوقت ثم إرسال التفاصيل إلى واتساب.
- الدفع: لا توجد بوابة دفع مفعلة في هذه النسخة. إذا سأل الزائر عن الدفع أو بوابة الدفع، وضّح أن الخطوة الصحيحة هي إكمال طلب الحجز عبر /booking ثم التواصل عبر واتساب لتأكيد التفاصيل.
- الصفحات: / (الرئيسية)، /services (الخدمات)، /booking (الحجز)، /articles (المقالات)، /where-we-work (نطاق الخدمة)، /about (من نحن)، /faq (الأسئلة الشائعة)، /customer-service (خدمة العملاء الذكية).
- رابط فيسبوك الرسمي: https://www.facebook.com/profile.php?id=61574523787419.
- لا توجد أسعار ثابتة منشورة؛ يجب طلب تفاصيل الخدمة والمدينة والموعد قبل تقدير مناسب.
- لا تدّعِ وجود تقييمات أو شهادات عملاء أو عروض أو توفر فوري غير مؤكد. عند عدم توافر معلومة، قل ذلك بوضوح واقترح التواصل عبر واتساب.
`;

export const internalNavigation = [
  { label: "الرئيسية", href: "/" },
  { label: "الخدمات", href: "/services" },
  { label: "الحجز", href: "/booking" },
  { label: "المقالات", href: "/articles" },
  { label: "نطاق الخدمة", href: "/where-we-work" },
  { label: "من نحن", href: "/about" },
  { label: "الأسئلة الشائعة", href: "/faq" },
  { label: "خدمة العملاء الذكية", href: "/customer-service" },
] as const;

export const siteContentCards: Record<SiteContentCard["id"], SiteContentCard> = {
  "cleaning-service": {
    id: "cleaning-service",
    kind: "service",
    title: "تنظيف المنازل",
    description: "ابدأ بتفاصيل المكان والأولوية، ثم اختر الموعد المناسب.",
    href: "/services",
    image: "/manus-storage/cleaning-spark-transparent_91163e0d.png",
  },
  "maintenance-service": {
    id: "maintenance-service",
    kind: "service",
    title: "الصيانة المنزلية",
    description: "مسار واضح لطلب الصيانة وتأكيد التفاصيل قبل الموعد.",
    href: "/services",
    image: "/manus-storage/maintenance-tools-transparent_75e7c68e.png",
  },
  "moving-service": {
    id: "moving-service",
    kind: "service",
    title: "نقل العفش",
    description: "رتّب نوع النقل والتفاصيل التي تهمك قبل التواصل.",
    href: "/services",
    image: "/manus-storage/moving-box-transparent_9c5b10ea.png",
  },
  "cleaning-guide": {
    id: "cleaning-guide",
    kind: "article",
    title: "دليل تنظيف المنزل",
    description: "خطوات عملية لترتيب أولوية التنظيف وتجهيز المكان.",
    href: "/articles/home-cleaning-guide",
  },
  "maintenance-guide": {
    id: "maintenance-guide",
    kind: "article",
    title: "دليل صيانة التكييف",
    description: "ملاحظات عملية تساعدك على وصف احتياج الصيانة بدقة.",
    href: "/articles/ac-maintenance-guide",
  },
  "moving-guide": {
    id: "moving-guide",
    kind: "article",
    title: "دليل نقل العفش",
    description: "قائمة تحضير هادئة للتغليف والترتيب قبل الانتقال.",
    href: "/articles/furniture-moving-guide",
  },
  "cleaning-video": {
    id: "cleaning-video",
    kind: "video",
    title: "مرئي خدمة التنظيف",
    description: "لمحة قصيرة من أسلوب العناية في خدمات التنظيف.",
    href: "/",
    video: "/manus-storage/ad-home-cleaning_8b448cef.mp4",
  },
  "maintenance-video": {
    id: "maintenance-video",
    kind: "video",
    title: "مرئي الصيانة المنزلية",
    description: "لقطة موجزة لمسار الصيانة في صفحة الخدمات.",
    href: "/services",
    video: "/manus-storage/ad-maintenance_ab0928ad.mp4",
  },
  "moving-video": {
    id: "moving-video",
    kind: "video",
    title: "مرئي نقل العفش",
    description: "لمحة من ترتيب وتغليف العفش قبل النقل.",
    href: "/services",
    video: "/manus-storage/ad-moving_5126576b.mp4",
  },
  booking: {
    id: "booking",
    kind: "booking",
    title: "جهّز طلبك للحجز",
    description: "اختر الخدمة والمدينة والموعد ثم أرسل الملخص إلى واتساب.",
    href: "/booking",
  },
};

export type RecommendationService = "cleaning" | "maintenance" | "moving" | "general";

export type RecommendationContext = {
  service: RecommendationService;
  city?: string;
};

const supportedCities = [
  ["الرياض", "riyadh"], ["جدة", "jeddah"], ["مكة المكرمة", "makkah"], ["المدينة المنورة", "madinah"], ["الدمام", "dammam"], ["الخبر", "khobar"], ["الطائف", "taif"], ["أبها", "abha"], ["تبوك", "tabuk"], ["بريدة", "buraydah"], ["عنيزة", "unaizah"], ["حائل", "hail"], ["جازان", "jazan"], ["نجران", "najran"], ["الأحساء", "al-ahsa"], ["الجبيل", "jubail"], ["ينبع", "yanbu"], ["سكاكا", "sakaka"], ["عرعر", "arar"], ["الباحة", "al-bahah"], ["خميس مشيط", "khamis-mushait"], ["القطيف", "qatif"], ["رأس تنورة", "ras-tanura"], ["الظهران", "dhahran"], ["الخرج", "al-kharj"], ["المجمعة", "al-majmaah"], ["الزلفي", "zulfi"], ["شقراء", "shaqra"], ["القنفذة", "qunfudhah"], ["رابغ", "rabigh"], ["الليث", "al-lith"], ["تربة", "turbah"], ["الوجه", "al-wajh"], ["أملج", "umlaj"], ["ضباء", "duba"], ["العلا", "al-ula"], ["الخفجي", "al-khafji"], ["حفر الباطن", "hafar-al-batin"], ["القريات", "qurayyat"], ["تيماء", "tayma"], ["الرس", "rass"], ["البكيرية", "bukayriyah"], ["المذنب", "mithnab"], ["عفيف", "afif"], ["الدوادمي", "dawadmi"], ["وادي الدواسر", "wadi-ad-dawasir"], ["الخرمة", "al-kharma"], ["رنية", "ranyah"], ["بيشة", "bisha"], ["محايل عسير", "muhayil"], ["صبيا", "sabya"], ["صامطة", "samtah"], ["أبو عريش", "abu-arish"], ["النماص", "al-namas"], ["بلجرشي", "baljurashi"], ["المندق", "al-mandaq"], ["العارضة", "al-ardah"], ["مدينة الملك عبدالله الاقتصادية", "kaec"],
] as const;

const serviceCardIds = {
  cleaning: ["cleaning-service", "cleaning-guide", "cleaning-video"],
  maintenance: ["maintenance-service", "maintenance-guide", "maintenance-video"],
  moving: ["moving-service", "moving-guide", "moving-video"],
} as const;

const serviceLabels: Record<Exclude<RecommendationService, "general">, string> = {
  cleaning: "تنظيف المنزل",
  maintenance: "الصيانة المنزلية",
  moving: "نقل العفش",
};

export function classifySiteQuestion(question: string): RecommendationContext {
  const normalized = question.toLowerCase();
  const city = [...supportedCities].sort(([first], [second]) => second.length - first.length).find(([name]) => normalized.includes(name))?.[0];
  const service: RecommendationService = /(نقل|عفش|اثاث|أثاث|تغليف|انتقال)/.test(normalized)
    ? "moving"
    : /(صيان|تكييف|تبريد|مكيف|كهرب|سباك)/.test(normalized)
      ? "maintenance"
      : /(تنظيف|شقة|شقه|منزل|مطبخ|حمام|غسيل)/.test(normalized)
        ? "cleaning"
        : "general";
  return { service, ...(city ? { city } : {}) };
}

export function recommendSiteContent(question: string): SiteContentCard[] {
  return recommendSiteContentByContext(classifySiteQuestion(question));
}

export function recommendSiteContentByContext(context: RecommendationContext): SiteContentCard[] {
  if (context.service === "general") {
    return context.city
      ? [siteContentCards.booking, { id: `city-${context.city}`, kind: "article", title: `مقالات الخدمات المنزلية في ${context.city}`, description: `افتح مكتبة المقالات ثم ابحث باسم ${context.city} لاختيار الدليل المحلي الأقرب لاحتياجك.`, href: "/articles" }, siteContentCards["cleaning-guide"]]
      : [siteContentCards["cleaning-service"], siteContentCards["maintenance-service"], siteContentCards.booking];
  }

  const [serviceCardId, guideCardId, videoCardId] = serviceCardIds[context.service];
  const defaultCards = [siteContentCards[serviceCardId], siteContentCards[guideCardId], siteContentCards[videoCardId]];
  if (!context.city) return defaultCards;
  const citySlug = supportedCities.find(([name]) => name === context.city)?.[1];
  if (!citySlug) return defaultCards;
  return [
    siteContentCards[serviceCardId],
    siteContentCards[guideCardId],
    {
      id: `${context.service}-${citySlug}-guide`,
      kind: "article",
      title: `دليل ${context.city} لتجهيز طلب الخدمة`,
      description: `مرجع محلي يكمل دليل ${serviceLabels[context.service]} ويساعدك على ترتيب العنوان والتفاصيل في ${context.city}.`,
      href: `/articles/${context.service === "cleaning" ? "cleaning" : context.service === "maintenance" ? "ac-maintenance" : "moving"}-${citySlug}`,
    },
  ];
}
