import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getAnonymousVisitorId } from "@/lib/visitor";
import { playReplyNotificationSound, shouldPlayReplyNotificationSound } from "@/lib/notificationSound";

const EMPTY_VISITOR_ID = "00000000-0000-4000-8000-000000000000";

export default function NotificationBell() {
  const [visitorId, setVisitorId] = useState<string>();
  useEffect(() => setVisitorId(getAnonymousVisitorId()), []);
  const unread = trpc.interactions.unreadNotificationCount.useQuery(
    { visitorId: visitorId ?? EMPTY_VISITOR_ID },
    { enabled: Boolean(visitorId), refetchInterval: 45_000, refetchOnWindowFocus: true },
  );
  const preferences = trpc.interactions.notificationPreferences.useQuery(
    { visitorId: visitorId ?? EMPTY_VISITOR_ID },
    { enabled: Boolean(visitorId), staleTime: 45_000 },
  );
  const highestKnownReplyId = useRef<number | undefined>(undefined);
  useEffect(() => {
    const latestReplyId = unread.data?.latestUnreadReplyId;
    if (!latestReplyId) return;
    if (highestKnownReplyId.current === undefined) {
      highestKnownReplyId.current = latestReplyId;
      return;
    }
    if (shouldPlayReplyNotificationSound(highestKnownReplyId.current, latestReplyId, preferences.data?.replySoundEnabled ?? false)) {
      highestKnownReplyId.current = latestReplyId;
      void playReplyNotificationSound().catch(() => undefined);
    }
  }, [unread.data?.latestUnreadReplyId, preferences.data?.replySoundEnabled]);
  const count = unread.data?.count ?? 0;
  const label = count ? `لديك ${count} إشعار غير مقروء` : "مركز الإشعارات";
  return <Link href="/notifications" className="notification-bell" aria-label={label} title={label}>
    <Bell size={20} strokeWidth={1.85} aria-hidden="true" />
    {count > 0 && <span className="notification-badge" aria-label={`${count} غير مقروء`}>{count > 99 ? "99+" : count}</span>}
  </Link>;
}
