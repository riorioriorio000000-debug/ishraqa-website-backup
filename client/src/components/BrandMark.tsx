// Design reminder: calm editorial service brand; use the generated droplet mark consistently in header, footer, and favicon.
const markUrl = "/manus-storage/brand-mark-generated_b4592103.png";
export default function BrandMark({ size = 54 }: { size?: number }) {
  return <img width={size} height={size} src={markUrl} alt="شعار الإشراقة" className="brand-mark" />;
}
