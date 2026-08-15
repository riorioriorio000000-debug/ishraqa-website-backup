// Design reminder: calm editorial service brand; use the generated droplet mark consistently in header, footer, and favicon.
const markUrl = "/manus-storage/ishraqa-original-logo_5e61c480.png";
export default function BrandMark({ size = 54 }: { size?: number }) {
  return <img src={markUrl} alt="شعار الإشراقة" className="brand-mark" style={{ height: size, width: "auto" }} />;
}
