import { BarChart3, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

const labels: Record<string, string> = {
  "/services": "صفحة الخدمات",
  "/calculator": "الحاسبة التقديرية",
  "/booking": "طلب خدمة",
  "/customer-service": "خدمة العملاء الذكية",
};

export default function ServicePageStats() {
  const stats = trpc.interactions.servicePageStats.useQuery();
  const rows = stats.data ?? [];
  return <section className="service-page-stats" aria-labelledby="service-page-stats-title">
    <div className="service-page-stats-heading"><span className="eyebrow"><i /> قراءة التفاعل</span><h2 id="service-page-stats-title">الصفحات الأكثر زيارة</h2><p>يعرض هذا الملخص الزيارات المسجلة لصفحات الخدمة داخل الموقع، ويُحدّث تلقائيًا مع استخدام الزوار لهذه الصفحات.</p></div>
    {stats.isLoading ? <p className="service-page-stats-empty">يجري تجهيز ملخص الزيارات…</p> : rows.length ? <ol className="service-page-stats-list">{rows.map((row, index) => <li key={row.pagePath}><span className="service-page-stats-rank">0{index + 1}</span><div><strong>{labels[row.pagePath] ?? row.pagePath}</strong><small>زيارات مسجلة</small></div><b><TrendingUp size={16} aria-hidden="true" /> {row.views}</b></li>)}</ol> : <p className="service-page-stats-empty"><BarChart3 size={20} aria-hidden="true" /> ستظهر الإحصاءات هنا عند تسجيل أول زيارات لصفحات الخدمات.</p>}
  </section>;
}
