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
    title: "العناية بأفران الغاز",
    description: "مقطع من عمل فعلي يوضح العناية بتنظيف فرن غاز ضمن تجهيزات المطبخ المنزلية.",
    src: "/media/oven-1.mp4",
    serviceId: "kitchen",
    serviceLabel: "خدمة تنظيف المنازل",
    servicePath: "/services/home-cleaning/riyadh",
  },
];

export function getVideoKey(src: string) {
  return `video:${src.split("/").pop()?.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase()}`;
}
