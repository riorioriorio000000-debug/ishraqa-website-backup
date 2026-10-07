import React from "react";

// الشعار المعتمد من المستخدم: يستخدم بصورة متسقة في الترويسة والتذييل.
const markUrl = "/media/brand.png";
export default function BrandMark({ size = 54 }: { size?: number }) {
  return <img src={markUrl} alt="شعار الإشراقة" className="brand-mark" style={{ height: size, width: "auto" }} />;
}
