export const serviceMedia = {
  ac: {
    image: "/media/ac.jpg",
    alt: "وحدة تكييف منزلية مع أدوات فحص وصيانة مرتبة",
  },
  tank: {
    image: "/media/tank.jpg",
    alt: "خزان مياه منزلي جاهز للعناية والتنظيف",
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

