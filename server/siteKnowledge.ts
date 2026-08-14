export type SiteContentCard = {
  id: "cleaning-service" | "maintenance-service" | "moving-service" | "cleaning-guide" | "maintenance-guide" | "moving-guide" | "cleaning-video" | "maintenance-video" | "moving-video" | "booking";
  kind: "service" | "article" | "video" | "booking";
  title: string;
  description: string;
  href: string;
  image?: string;
  video?: string;
};

export const siteKnowledge = `
معلومات موقع شركة الإشراقة للتنظيف والصيانة ونقل العفش:
- الهاتف وواتساب: 0509614797، ورابط واتساب الصحيح هو https://wa.me/966509614797.
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

export function recommendSiteContent(question: string): SiteContentCard[] {
  const normalized = question.toLowerCase();
  if (/(نقل|عفش|اثاث|أثاث|تغليف|انتقال)/.test(normalized)) {
    return [siteContentCards["moving-service"], siteContentCards["moving-guide"], siteContentCards["moving-video"]];
  }
  if (/(صيان|تكييف|تبريد|مكيف|كهرب|سباك)/.test(normalized)) {
    return [siteContentCards["maintenance-service"], siteContentCards["maintenance-guide"], siteContentCards["maintenance-video"]];
  }
  if (/(تنظيف|شقة|شقه|منزل|مطبخ|حمام|غسيل)/.test(normalized)) {
    return [siteContentCards["cleaning-service"], siteContentCards["cleaning-guide"], siteContentCards["cleaning-video"]];
  }
  return [siteContentCards["cleaning-service"], siteContentCards["maintenance-service"], siteContentCards.booking];
}
