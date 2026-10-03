export const serviceMedia = {
  ac: {
    image: "/ishraqa-website-backup/media/ac.jpg",
    alt: "وحدة تكييف منزلية مع أدوات فحص وصيانة مرتبة",
    video: "/ishraqa-website-backup/media/ac.mp4",
    videoTitle: "فحص وحدة تكييف من واقع العمل",
    videoDescription: "مقطع حقيقي قصير يوضح سياق فحص وحدة تكييف منزلية وتجهيز منطقة العمل دون إظهار أشخاص.",
  },
  tank: {
    image: "/ishraqa-website-backup/media/tank.jpg",
    alt: "خزان مياه منزلي جاهز للعناية والتنظيف",
    video: "/ishraqa-website-backup/media/tank.mp4",
    videoTitle: "العناية بخزان مياه من واقع العمل",
    videoDescription: "مقطع حقيقي قصير من تجهيز والعناية بخزان مياه منزلي دون إظهار أشخاص.",
  },
  cleaning: {
    image: "/ishraqa-website-backup/media/sofa.jpg",
    alt: "مستلزمات تنظيف منزلية مرتبة بجوار أسطح قابلة للعناية",
  },
  floorCleaning: {
    image: "/ishraqa-website-backup/media/sofa.jpg",
    alt: "أدوات تنظيف أرضيات منزلية مرتبة للاستخدام المنظم",
  },
  plumbing: {
    image: "/ishraqa-website-backup/media/ac.jpg",
    alt: "أدوات صيانة سباكة منزلية مرتبة لفحص نقطة خدمة",
  },
  pestControl: {
    image: "/ishraqa-website-backup/media/sofa.jpg",
    alt: "أدوات مكافحة حشرات منزلية مرتبة في مطبخ حديث بدون أشخاص",
  },
} as const;

export function getLocalServiceMediaImage(serviceSlug: string) {
  if (serviceSlug === "ac-maintenance") return serviceMedia.ac.image;
  if (serviceSlug === "tank-cleaning" || serviceSlug === "insulation") return serviceMedia.tank.image;
  if (serviceSlug === "home-maintenance") return serviceMedia.plumbing.image;
  if (serviceSlug === "home-cleaning" || serviceSlug === "sofa-cleaning") return serviceMedia.cleaning.image;
  if (serviceSlug === "pest-control") return serviceMedia.pestControl.image;
  if (serviceSlug === "furniture-moving") return serviceMedia.floorCleaning.image;
  if (serviceSlug === "painting") return serviceMedia.plumbing.image;
  return undefined;
}

export function getLocalServiceMediaAlt(serviceSlug: string) {
  if (serviceSlug === "ac-maintenance") return serviceMedia.ac.alt;
  if (serviceSlug === "tank-cleaning" || serviceSlug === "insulation") return serviceMedia.tank.alt;
  if (serviceSlug === "home-maintenance" || serviceSlug === "painting") return serviceMedia.plumbing.alt;
  if (serviceSlug === "home-cleaning" || serviceSlug === "sofa-cleaning") return serviceMedia.cleaning.alt;
  if (serviceSlug === "pest-control") return serviceMedia.pestControl.alt;
  if (serviceSlug === "furniture-moving") return serviceMedia.floorCleaning.alt;
  return undefined;
}

export function getServiceVideoPoster(src: string) {
  if (src === serviceMedia.ac.video) return serviceMedia.ac.image;
  if (src === serviceMedia.tank.video) return serviceMedia.tank.image;
  if (src.includes("oven")) return serviceMedia.floorCleaning.image;
  return serviceMedia.cleaning.image;
}
