import { serviceMedia } from "@/data/serviceMedia";

export type WorkVideo = {
  title: string;
  description: string;
  src: string;
  serviceId: "upholstery" | "kitchen" | "ac" | "tanks";
  serviceLabel: string;
  servicePath: string;
};

export const workVideoServiceFilters = [
  { id: "all", label: "كل الخدمات" },
  { id: "upholstery", label: "الكنب والمفروشات" },
  { id: "kitchen", label: "المطبخ والأفران" },
  { id: "ac", label: "التكييف" },
  { id: "tanks", label: "الخزانات" },
] as const;

export type WorkVideoServiceFilter = typeof workVideoServiceFilters[number]["id"];

export const workVideos: readonly WorkVideo[] = [
  {
    title: "تنظيف الكنب والمجالس",
    description: "لقطة حقيقية من العناية بكنب منزلي، مع تركيز على سطح المفروشات والتفاصيل القريبة.",
    src: "/manus-storage/ishraqa-upholstery-work-01_c6221152.mp4",
    serviceId: "upholstery",
    serviceLabel: "خدمة تنظيف الكنب",
    servicePath: "/services/sofa-cleaning/riyadh",
  },
  {
    title: "فرن الغاز بعد العناية",
    description: "لقطة من نتيجة عمل على فرن غاز منزلي بعد إتمام العناية الأساسية ضمن المطبخ.",
    src: "/manus-storage/ishraqa-oven-work-02_eec8b074.mp4",
    serviceId: "kitchen",
    serviceLabel: "خدمة تنظيف المنازل",
    servicePath: "/services/home-cleaning/riyadh",
  },
  {
    title: "تنظيف المفروشات المنزلية",
    description: "مقطع ثانٍ من عمل تنظيف مفروشات يوضح التعامل الهادئ مع المقعد قبل نهاية الخدمة.",
    src: "/manus-storage/ishraqa-upholstery-work-02_f51aee76.mp4",
    serviceId: "upholstery",
    serviceLabel: "خدمة تنظيف الكنب",
    servicePath: "/services/sofa-cleaning/riyadh",
  },
  {
    title: "العناية بأفران الغاز",
    description: "مقطع من عمل فعلي يوضح العناية بتنظيف فرن غاز ضمن تجهيزات المطبخ المنزلية.",
    src: "/manus-storage/ishraqa-oven-work-01_28be488e.mp4",
    serviceId: "kitchen",
    serviceLabel: "خدمة تنظيف المنازل",
    servicePath: "/services/home-cleaning/riyadh",
  },
  {
    title: serviceMedia.ac.videoTitle,
    description: serviceMedia.ac.videoDescription,
    src: serviceMedia.ac.video,
    serviceId: "ac",
    serviceLabel: "خدمة صيانة التكييف",
    servicePath: "/services/ac-maintenance/riyadh",
  },
  {
    title: serviceMedia.tank.videoTitle,
    description: serviceMedia.tank.videoDescription,
    src: serviceMedia.tank.video,
    serviceId: "tanks",
    serviceLabel: "خدمة تنظيف الخزانات",
    servicePath: "/services/tank-cleaning/riyadh",
  },
];

export function getVideoKey(src: string) {
  return `video:${src.split("/").pop()?.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase()}`;
}
