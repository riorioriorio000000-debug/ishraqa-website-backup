import { useEffect } from "react";
import { useLocation } from "wouter";

export default function RouteScrollTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}
