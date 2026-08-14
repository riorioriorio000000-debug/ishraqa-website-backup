export type ServiceKey = "cleaning" | "maintenance" | "moving";
export type PropertyKey = "apartment" | "villa" | "office";
export type SizeKey = "small" | "medium" | "large";

export const serviceLabels: Record<ServiceKey, string> = {
  cleaning: "تنظيف",
  maintenance: "صيانة",
  moving: "نقل عفش",
};

export const propertyLabels: Record<PropertyKey, string> = {
  apartment: "شقة",
  villa: "فيلا",
  office: "مكتب أو منشأة",
};

export const sizeLabels: Record<SizeKey, string> = {
  small: "مساحة صغيرة أو غرفة إلى غرفتين",
  medium: "مساحة متوسطة أو 3 إلى 4 غرف",
  large: "مساحة كبيرة أو أكثر من 4 غرف",
};

export function calculateServicePlan({ service, property, size, city, details = "" }: { service: ServiceKey; property: PropertyKey; size: SizeKey; city: string; details?: string }) {
  const visitLevel = size === "large" ? "تنسيق موسع وقد يحتاج معاينة قصيرة" : size === "medium" ? "تنسيق متوسط مع تحديد التفاصيل مسبقًا" : "تنسيق مبدئي سريع بعد مراجعة الطلب";
  const focus = service === "cleaning" ? "المساحات، المطبخ، دورات المياه، وأي نقطة تحتاج عناية إضافية" : service === "maintenance" ? "نوع العطل، الجهاز أو الجزء المعني، ومدى الاستعجال" : "عدد القطع الكبيرة، التغليف، الطوابق، ووجود مصعد";
  return {
    visitLevel,
    focus,
    message: `مرحبًا الإشراقة، أريد ${serviceLabels[service]} لـ ${propertyLabels[property]} في ${city || "مدينة أخرى"}. حجم المكان: ${sizeLabels[size]}.${details.trim() ? ` تفاصيل إضافية: ${details.trim()}.` : ""} أحتاج منكم تأكيد الموعد والتفاصيل المطلوبة.`,
  };
}
