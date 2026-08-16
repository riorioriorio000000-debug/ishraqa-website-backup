import { BellRing, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import SiteShell from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";
import { getAnonymousVisitorId } from "@/lib/visitor";
import { toast } from "sonner";

const EMPTY_VISITOR_ID = "00000000-0000-4000-8000-000000000000";

export default function NotificationPreferencesPage() {
  const [visitorId, setVisitorId] = useState<string>();
  const [reactionNotificationsEnabled, setReactionNotificationsEnabled] = useState(true);
  useEffect(() => setVisitorId(getAnonymousVisitorId()), []);

  const preferences = trpc.interactions.notificationPreferences.useQuery(
    { visitorId: visitorId ?? EMPTY_VISITOR_ID },
    { enabled: Boolean(visitorId) },
  );
  useEffect(() => {
    if (preferences.data) setReactionNotificationsEnabled(preferences.data.reactionNotificationsEnabled);
  }, [preferences.data]);
  const updatePreferences = trpc.interactions.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      void preferences.refetch();
      toast.success("تم حفظ تفضيلات الإشعارات.");
    },
    onError: () => toast.error("تعذر حفظ التفضيل الآن. حاول مرة أخرى."),
  });
  const updateReactionPreference = (enabled: boolean) => {
    setReactionNotificationsEnabled(enabled);
    if (!visitorId) return;
    updatePreferences.mutate({ visitorId, reactionNotificationsEnabled: enabled });
  };

  return <SiteShell>
    <PageMeta
      title="تفضيلات الإشعارات"
      description="تحكم في تنبيهات التفاعل الخاصة بهوية زائرك المجهولة في موقع الإشراقة، مع استمرار تنبيهات الردود المهمة."
      keywords={["تفضيلات الإشعارات", "إشعارات التعليقات", "خصوصية الزائر", "الإشراقة"]}
      path="/notification-preferences"
    />
    <main className="inner-page notification-preferences-page" dir="rtl">
      <section className="inner-hero notification-preferences-hero">
        <div className="shell">
          <span className="eyebrow"><i /> تحكم بسيط</span>
          <h1>تفضيلات الإشعارات</h1>
          <p>اختر ما تريد تلقيه على هذا المتصفح، من دون إنشاء حساب أو إدخال بيانات اتصال.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell notification-preferences-shell">
          <article className="notification-preferences-card">
            <div className="notification-preferences-intro"><div className="notification-preferences-icon"><BellRing size={23} aria-hidden="true" /></div><div><h2>تنبيهات التفاعل</h2><p>تصل عند تفاعل زائر آخر مع تعليقك بقلب أو عدم إعجاب.</p></div></div>
            <label className="notification-toggle-row">
              <span><Heart size={19} aria-hidden="true" /><span><strong>تنبيهات الإعجابات والتفاعلات</strong><small>{reactionNotificationsEnabled ? "مفعّلة الآن" : "متوقفة الآن"}</small></span></span>
              <input type="checkbox" checked={reactionNotificationsEnabled} disabled={!visitorId || preferences.isLoading || updatePreferences.isPending} onChange={event => updateReactionPreference(event.target.checked)} />
            </label>
          </article>
          <article className="notification-preferences-note">
            <MessageCircle size={21} aria-hidden="true" />
            <div><h2>تنبيهات الردود تبقى مفعّلة</h2><p>الردود على تعليقك ونتائج بلاغات المحتوى ورسائل النظام المهمة لا تتأثر بهذا الخيار.</p></div>
          </article>
          <p className="notification-preferences-privacy"><ShieldCheck size={17} aria-hidden="true" /> ترتبط هذه الإعدادات بمعرّف زائر عشوائي محفوظ في متصفحك. <Link href="/privacy">اقرأ سياسة الخصوصية</Link>.</p>
          <Link href="/notifications" className="button button-ghost notification-preferences-back">العودة إلى مركز الإشعارات</Link>
        </div>
      </section>
    </main>
  </SiteShell>;
}
