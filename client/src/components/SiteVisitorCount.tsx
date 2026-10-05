import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

import { createClientId } from "@/lib/uuid";
const VISITOR_STORAGE_KEY = "ishraqa-anonymous-visitor";

function getVisitorId() {
  const known = localStorage.getItem(VISITOR_STORAGE_KEY);
  if (known) return known;
  const created = createClientId();
  localStorage.setItem(VISITOR_STORAGE_KEY, created);
  return created;
}

export default function SiteVisitorCount() {
  const [visitorId, setVisitorId] = useState<string>();
  const count = trpc.interactions.visitorCount.useQuery();
  const record = trpc.interactions.recordVisitor.useMutation({ onSuccess: () => count.refetch() });

  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);
    record.mutate({ visitorId: id });
  }, []);

  if (!visitorId) return null;
  return <p className="footer-visitor-count" aria-live="polite"><span className="footer-visitor-number">{count.data ?? 0}</span><span className="footer-visitor-label">زائرًا للموقع</span></p>;
}
