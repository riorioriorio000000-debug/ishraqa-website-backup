import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BellRing, CheckCheck, FileSearch, Settings2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import SiteShell from "@/components/SiteShell";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import { getAnonymousVisitorId } from "@/lib/visitor";
import { toast } from "sonner";

const EMPTY_VISITOR_ID = "00000000-0000-4000-8000-000000000000";

function formatNotificationDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationsPage() {
  const [visitorId, setVisitorId] = useState<string>();
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
  const unreadIds = useMemo(() => notifications.data?.filter(item => !item.isRead).map(item => item.id) ?? [], [notifications.data]);
  useEffect(() => {
    if (visitorId && unreadIds.length && !markRead.isPending) markRead.mutate({ visitorId, ids: unreadIds });
  }, [visitorId, unreadIds, markRead]);

  return <SiteShell><PageMeta title="الإشعارات" description="اطلع على تحديثات تعليقاتك وقرارات مراجعة البلاغات داخل موقع الإشراقة." keywords={["إشعارات الإشراقة", "بلاغات التعليقات", "ردود التعليقات"]} path="/notifications" />
    <main className="notifications-page" dir="rtl">
      <section className="inner-hero notification-hero"><div className="shell inner-hero-grid"><div><span className="eyebrow"><i /> متابعة التفاعل</span><h1>مركز <em>الإشعارات.</em></h1><p>تابع الردود والتفاعلات ونتائج مراجعة البلاغات من مكان واحد، دون إنشاء حساب أو إدخال بيانات شخصية.</p></div><div className="inner-hero-mark" aria-hidden="true"><BellRing size={54} /></div></div><div className="inner-wave" /></section>
      <section className="section section-paper"><div className="shell notifications-shell">
        <div className="notifications-head"><div><span className="eyebrow"><i /> تحديثاتك</span><h2>آخر ما وصل إليك.</h2></div><div className="notifications-head-actions"><Link href="/notification-preferences" className="notification-preferences-link"><Settings2 size={16} /> تفضيلات الإشعارات</Link>{notifications.data?.length ? <button type="button" className="notification-mark-all" disabled={markRead.isPending} onClick={() => visitorId && markRead.mutate({ visitorId })}><CheckCheck size={17} /> تعليم الكل كمقروء</button> : null}</div></div>
        {notifications.isLoading && <p className="notification-state">جارٍ تجهيز إشعاراتك…</p>}
        {notifications.isError && <div className="notification-state notification-error"><ShieldAlert size={22} /><p>تعذر تحميل الإشعارات الآن. حدّث الصفحة أو أعد المحاولة بعد قليل.</p></div>}
        {!notifications.isLoading && !notifications.isError && !notifications.data?.length && <div className="notification-empty"><BellRing size={33} /><h2>لا توجد إشعارات بعد.</h2><p>عند وصول رد أو تفاعل على تعليقك، أو ظهور نتيجة لبلاغ أرسلته، ستجده هنا.</p><Link href="/articles" className="button button-ghost">استكشف المقالات <ArrowLeft size={16} /></Link></div>}
        <div className="notification-list">{notifications.data?.map(item => <article className={`notification-item ${item.isRead ? "is-read" : "is-unread"}`} key={item.id}><div className="notification-icon" aria-hidden="true">{item.type === "report_review" ? <FileSearch size={21} /> : item.type === "comment_restricted" || item.type === "comment_deleted" ? <ShieldAlert size={21} /> : <BellRing size={21} />}</div><div className="notification-copy"><div><h2>{item.title}</h2><time dateTime={new Date(item.createdAt).toISOString()}>{formatNotificationDate(item.createdAt)}</time></div><p>{item.message}</p><div className="notification-links">{item.targetPath && <Link href={item.targetPath}>عرض السياق <ArrowLeft size={15} /></Link>}{item.type === "report_review" && item.entityType === "report" && item.entityId && <button type="button" className="notification-recheck" disabled={!visitorId || recheck.isPending} onClick={() => visitorId && recheck.mutate({ reportId: item.entityId!, visitorId })}>{recheck.isPending ? "جارٍ المراجعة…" : "طلب إعادة التحقق"}</button>}</div></div></article>)}</div>
      </div></section>
    </main>
  </SiteShell>;
}
