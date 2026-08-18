export const serviceMedia = {
  ac: {
    image: "/manus-storage/ishraqa-ac-maintenance_23ac4881.png",
    alt: "وحدة تكييف منزلية مع أدوات فحص وصيانة مرتبة",
    video: "/manus-storage/ishraqa-ac-work_9f225e58.mp4",
    videoTitle: "فحص وحدة تكييف من واقع العمل",
    videoDescription: "مقطع حقيقي قصير يوضح سياق فحص وحدة تكييف منزلية وتجهيز منطقة العمل دون إظهار أشخاص.",
  },
  tank: {
    image: "/manus-storage/ishraqa-tank-cleaning_105da008.jpg",
    alt: "خزان مياه منزلي جاهز للعناية والتنظيف",
    video: "/manus-storage/ishraqa-tank-work_4c069ae7.mp4",
    videoTitle: "العناية بخزان مياه من واقع العمل",
    videoDescription: "مقطع حقيقي قصير من تجهيز والعناية بخزان مياه منزلي دون إظهار أشخاص.",
  },
  cleaning: {
    image: "/manus-storage/ishraqa-cleaning-supplies_6498de1c.png",
    alt: "مستلزمات تنظيف منزلية مرتبة بجوار أسطح قابلة للعناية",
  },
  floorCleaning: {
    image: "/manus-storage/ishraqa-floor-cleaning-tools_b553f9b7.png",
    alt: "أدوات تنظيف أرضيات منزلية مرتبة للاستخدام المنظم",
  },
  plumbing: {
    image: "/manus-storage/ishraqa-plumbing-maintenance_dd3ce02a.png",
    alt: "أدوات صيانة سباكة منزلية مرتبة لفحص نقطة خدمة",
  },
} as const;

export function getLocalServiceMediaImage(serviceSlug: string) {
  if (serviceSlug === "ac-maintenance") return serviceMedia.ac.image;
  if (serviceSlug === "tank-cleaning" || serviceSlug === "insulation") return serviceMedia.tank.image;
  if (serviceSlug === "home-maintenance") return serviceMedia.plumbing.image;
  if (serviceSlug === "home-cleaning" || serviceSlug === "sofa-cleaning") return serviceMedia.cleaning.image;
  return undefined;
}

export function getServiceVideoPoster(src: string) {
  if (src === serviceMedia.ac.video) return serviceMedia.ac.image;
  if (src === serviceMedia.tank.video) return serviceMedia.tank.image;
  if (src.includes("oven")) return serviceMedia.floorCleaning.image;
  return serviceMedia.cleaning.image;
}
