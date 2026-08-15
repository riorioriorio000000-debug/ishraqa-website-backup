import React from "react";

// الشعار المعتمد من المستخدم: يستخدم بصورة متسقة في الترويسة والتذييل.
const markUrl = "/manus-storage/ishraqa-user-logo_64a160a3.png";
export default function BrandMark({ size = 54 }: { size?: number }) {
  return <img src={markUrl} alt="شعار الإشراقة" className="brand-mark" style={{ height: size, width: "auto" }} />;
}
