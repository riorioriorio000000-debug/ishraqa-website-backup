import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

import { createClientId } from "@/lib/uuid";
const visitorStorageKey = "ishraqa-anonymous-visitor";
const trackedPaths = new Set(["/services", "/calculator", "/booking", "/customer-service"]);

function visitorId() {
  const saved = localStorage.getItem(visitorStorageKey);
  if (saved) return saved;
  const created = createClientId();
  localStorage.setItem(visitorStorageKey, created);
  return created;
}

export default function ServicePageVisitTracker() {
  const [location] = useLocation();
  const recordView = trpc.interactions.recordServicePageView.useMutation();

  useEffect(() => {
    if (!trackedPaths.has(location)) return;
    const key = `ishraqa-service-page-viewed:${location}`;
    if (sessionStorage.getItem(key)) return;
    visitorId();
    sessionStorage.setItem(key, "1");
    recordView.mutate({ pagePath: location as "/services" | "/calculator" | "/booking" | "/customer-service" });
  }, [location]);

  return null;
}
