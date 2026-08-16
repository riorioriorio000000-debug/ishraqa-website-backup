import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BellRing, CheckCheck, FileSearch, Heart, MessageCircle, Settings2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import { getAnonymousVisitorId } from "@/lib/visitor";
import { toast } from "sonner";

const EMPTY_VISITOR_ID = "00000000-0000-4000-8000-000000000000";
type NotificationFilter = "all" | "unread" | "read";

function NotificationAvatar({ type }: { type: "reply" | "reaction" | "comment_published" | "comment_deleted" | "comment_reverted" | "comment_restricted" | "report_review" }) {
  if (type === "report_review") return <div className="notification-avatar is-ai"><img src="/manus-storage/ai-review-notification-avatar_b4a653c2.png" alt="مساعد المراجعة الذكي" loading="lazy" /></div>;
  if (type === "reply" || type === "reaction") return <div className="notification-avatar is-visitor" aria-label="تفاعل من زائر">{type === "reply" ? <MessageCircle size={20} /> : <Heart size={20} fill="currentColor" />}</div>;
  return <div className="notification-avatar is-system"><img src="/manus-storage/system-notification-avatar_ddf070fb.png" alt="نظام الإشراقة" loading="lazy" /></div>;
}

function formatNotificationDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationsPage() {
  const [visitorId, setVisitorId] = useState<string>();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [openNotificationKey, setOpenNotificationKey] = useState<string>();
  useEffect(() => setVisitorId(getAnonymousVisitorId()), []);
  const utils = trpc.useUtils();
  const notifications = trpc.interactions.listNotifications.useQuery(
    { visitorId: visitorId ?? EMPTY_VISITOR_ID },
    { enabled: Boolean(visitorId), refetchOnWindowFocus: true },
  );
  const markRead = trpc.interactions.markNotificationsRead.useMutation({
    onSuccess: () => {
      void notifications.refetch();
      void utils.interactions.unreadNotificationCount.invalidate();
    },
  });
  const recheck = trpc.moderation.requestRecheck.useMutation({
    onSuccess: result => {
      toast.success(result.accepted ? "اكتملت إعادة التحقق، وستظهر النتيجة في إشعاراتك." : "لا يمكن طلب إعادة التحقق لهذا البلاغ الآن.");
      void notifications.refetch();
    },
    onError: () => toast.error("تعذر طلب إعادة التحقق الآن. حاول لاحقًا."),
  });
  const filteredNotifications = useMemo(() => notifications.data?.filter(item => filter === "all" || (filter === "read" ? item.isRead : !item.isRead)) ?? [], [filter, notifications.data]);
  const filterCounts = useMemo(() => ({ all: notifications.data?.length ?? 0, unread: notifications.data?.filter(item => !item.isRead).length ?? 0, read: notifications.data?.filter(item => item.isRead).length ?? 0 }), [notifications.data]);
  const notificationGroups = useMemo(() => {
    const groups = new Map<string, typeof filteredNotifications>();
    for (const item of filteredNotifications) {
      const key = item.type === "reply" && item.targetPath ? `reply:${item.targetPath}` : `single:${item.id}`;
      const group = groups.get(key) ?? [];
      group.push(item);
      groups.set(key, group);
    }
    return Array.from(groups.entries()).map(([key, items]) => ({ key, items, latest: items[0] }));
  }, [filteredNotifications]);
  const openNotification = (key: string, items: typeof filteredNotifications) => {
    setOpenNotificationKey(current => current === key ? undefined : key);
    const unreadIds = items.filter(item => !item.isRead).map(item => item.id);
    if (visitorId && unreadIds.length && !markRead.isPending) markRead.mutate({ visitorId, ids: unreadIds });
  };

  return <SiteShell><PageMeta title="الإشعارات" description="اطلع على تحديثات تعليقاتك وقرارات مراجعة البلاغات داخل موقع الإشراقة." keywords={["إشعارات الإشراقة", "بلاغات التعليقات", "ردود التعليقات"]} path="/notifications" />
    <main className="notifications-page" dir="rtl">
      <section className="inner-hero notification-hero"><div className="shell inner-hero-grid"><div><span className="eyebrow"><i /> متابعة التفاعل</span><h1>مركز <em>الإشعارات.</em></h1><p>تابع الردود والتفاعلات ونتائج مراجعة البلاغات من مكان واحد، دون إنشاء حساب أو إدخال بيانات شخصية.</p></div><div className="inner-hero-mark" aria-hidden="true"><BellRing size={54} /></div></div><div className="inner-wave" /></section>
      <section className="section section-paper"><div className="shell notifications-shell">
        <div className="notifications-head"><div><span className="eyebrow"><i /> تحديثاتك</span><h2>آخر ما وصل إليك.</h2></div><div className="notifications-head-actions"><Link href="/notification-preferences" className="notification-preferences-link"><Settings2 size={16} /> تفضيلات الإشعارات</Link>{notifications.data?.length ? <button type="button" className="notification-mark-all" disabled={markRead.isPending} onClick={() => visitorId && markRead.mutate({ visitorId })}><CheckCheck size={17} /> تعليم الكل كمقروء</button> : null}</div></div>
        {notifications.data?.length ? <div className="notification-filters" role="group" aria-label="تصفية الإشعارات حسب حالة القراءة">{(["all", "unread", "read"] as const).map(item => <button key={item} type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === "all" ? "الكل" : item === "unread" ? "غير مقروءة" : "مقروءة"}<span>{filterCounts[item]}</span></button>)}</div> : null}
        {notifications.isLoading && <p className="notification-state">جارٍ تجهيز إشعاراتك…</p>}
        {notifications.isError && <div className="notification-state notification-error"><ShieldAlert size={22} /><p>تعذر تحميل الإشعارات الآن. حدّث الصفحة أو أعد المحاولة بعد قليل.</p></div>}
        {!notifications.isLoading && !notifications.isError && !notifications.data?.length && <div className="notification-empty"><BellRing size={33} /><h2>لا توجد إشعارات بعد.</h2><p>عند وصول رد أو تفاعل على تعليقك، أو ظهور نتيجة لبلاغ أرسلته، ستجده هنا.</p><Link href="/articles" className="button button-ghost">استكشف المقالات <ArrowLeft size={16} /></Link></div>}
        {!notifications.isLoading && !notifications.isError && Boolean(notifications.data?.length) && !filteredNotifications.length && <div className="notification-filter-empty">لا توجد إشعارات ضمن هذا الفلتر.</div>}
        <div className="notification-list">{notificationGroups.map(group => { const { items, latest } = group; const isGroupedReply = latest.type === "reply" && items.length > 1; const isOpen = openNotificationKey === group.key; const hasUnread = items.some(item => !item.isRead); const itemTitle = isGroupedReply ? `${latest.title} · ${items.length} ردود` : latest.title; const compactMessage = `${latest.message.slice(0, 125)}${latest.message.length > 125 ? "…" : ""}`; return <article className={`notification-item ${hasUnread ? "is-unread" : "is-read"} ${isOpen ? "is-open" : ""} ${isGroupedReply ? "is-grouped" : ""}`} key={group.key}><NotificationAvatar type={latest.type} /><div className="notification-copy"><div><div><h2>{itemTitle}</h2><span className="notification-source">{isGroupedReply ? `${items.length} ردود على نفس التعليق` : latest.type === "report_review" ? "مساعد المراجعة الذكي" : latest.type === "reply" || latest.type === "reaction" ? "تفاعل من زائر" : "نظام الإشراقة"}</span></div><time dateTime={new Date(latest.createdAt).toISOString()}>{formatNotificationDate(latest.createdAt)}</time></div><p>{isOpen && !isGroupedReply ? latest.message : compactMessage}</p>{isOpen && isGroupedReply && <div className="notification-group-details" aria-label="تفاصيل الردود المجمعة">{items.map(item => <article key={item.id}><time dateTime={new Date(item.createdAt).toISOString()}>{formatNotificationDate(item.createdAt)}</time><p>{item.message}</p></article>)}</div>}<div className="notification-links"><button type="button" className="notification-open" aria-expanded={isOpen} onClick={() => openNotification(group.key, items)}>{isOpen ? "إخفاء التفاصيل" : isGroupedReply ? "عرض الردود" : "فتح الإشعار"} <ArrowLeft size={15} /></button>{isOpen && latest.targetPath && <Link href={latest.targetPath}>عرض السياق <ArrowLeft size={15} /></Link>}{isOpen && latest.type === "report_review" && latest.entityType === "report" && latest.entityId && <button type="button" className="notification-recheck" disabled={!visitorId || recheck.isPending} onClick={() => visitorId && recheck.mutate({ reportId: latest.entityId!, visitorId })}>{recheck.isPending ? "جارٍ المراجعة…" : "طلب إعادة التحقق"}</button>}</div></div></article>; })}</div>
      </div></section>
    </main>
  </SiteShell>;
}
