// Design reminder: calm editorial service brand; use the generated droplet mark consistently in header, footer, and favicon.
const markUrl = "/manus-storage/ishraqa-blue-mark_51e1bd1d.png";
export default function BrandMark({ size = 68 }: { size?: number }) {
  return <img src={markUrl} alt="شعار الإشراقة" className="brand-mark" style={{ height: size, width: "auto" }} />;
}
