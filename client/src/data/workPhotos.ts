export type WorkPhoto = {
  title: string;
  description: string;
  src: string;
  alt: string;
  servicePath: string;
};

// لا تضم هذه القائمة إلا صورًا فوتوغرافية ميدانية تحقّقنا من خلوها من الأشخاص والبيانات الشخصية.
export const workPhotos: readonly WorkPhoto[] = [
  {
    title: "تنظيف داخل خزان مياه",
    description: "لقطة ميدانية لداخل خزان ماء أثناء مرحلة التنظيف، من دون ظهور أشخاص.",
    src: "/media/tank.jpg",
    alt: "داخل خزان مياه منزلي أثناء التنظيف مع خرطوم ماء، دون ظهور أشخاص",
    servicePath: "/services/tank-cleaning/riyadh",
  },
];
