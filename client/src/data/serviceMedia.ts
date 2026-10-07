export const serviceMedia = {
  ac: {
    image: "/media/ac.jpg",
    alt: "وحدة تكييف منزلية مع أدوات فحص وصيانة مرتبة",
    video: "/media/ac.mp4",
    videoTitle: "فحص وحدة تكييف من واقع العمل",
    videoDescription: "مقطع حقيقي قصير يوضح سياق فحص وحدة تكييف منزلية وتجهيز منطقة العمل دون إظهار أشخاص.",
  },
  tank: {
    image: "/media/tank.jpg",
    alt: "خزان مياه منزلي جاهز للعناية والتنظيف",
    video: "/media/tank.mp4",
    videoTitle: "العناية بخزان مياه من واقع العمل",
    videoDescription: "مقطع حقيقي قصير من تجهيز والعناية بخزان مياه منزلي دون إظهار أشخاص.",
  },
  cleaning: {
    image: "/media/cleaning-tools.png",
    alt: "معدات تنظيف منزلية مرتبة للعناية بالأسطح دون ظهور أشخاص",
  },
  floorCleaning: {
    image: "/media/sofa-work.jpg",
    alt: "سطح أريكة منزلي أثناء العناية والتنظيف دون ظهور أشخاص",
  },
  plumbing: {
    image: "/media/ac.jpg",
    alt: "وحدة تكييف منزلية وأجزاء فحص صيانة مرتبة دون ظهور أشخاص",
  },
  pestControl: {
    image: "/media/pest-control.png",
    alt: "معدات مكافحة آفات منزلية وعبوة رش مرتبة دون ظهور أشخاص",
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
