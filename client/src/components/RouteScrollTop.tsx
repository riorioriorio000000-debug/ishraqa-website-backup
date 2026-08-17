import { useEffect } from "react";
import { useLocation } from "wouter";

export default function RouteScrollTop() {
  const [location] = useLocation();

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (targetId) {
      const timer = window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "auto" }), 0);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}
