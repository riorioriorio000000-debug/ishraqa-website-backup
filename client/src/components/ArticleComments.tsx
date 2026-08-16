import { Heart, HeartCrack, MessageCircle, Pencil, Send, Star, Trash2 } from "lucide-react";
import React, { FormEvent, ReactNode, useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { nextReaction } from "@shared/interactionHelpers";
import { toast } from "sonner";

const avatarKinds = ["wave", "spark", "leaf", "star"] as const;
const readyAvatarOptions = [
  { url: "/manus-storage/saudi-flag-riyadh_2e59cf4a.jpg", label: "أعلام السعودية في الرياض" },
  { url: "/manus-storage/saudi-traveler_31726f72.jpg", label: "مسافر سعودي" },
  { url: "/manus-storage/saudi-portrait-bw_78e11ff7.jpg", label: "صورة شخصية سعودية بالأبيض والأسود" },
  { url: "/manus-storage/desert-profile_5a61b5b1.jpg", label: "مشهد صحراوي سعودي" },
  { url: "/manus-storage/heritage-portrait_85fda9b1.jpg", label: "صورة تراثية سعودية" },
  { url: "/manus-storage/saudi-emblem_3ec6d2c3.jpg", label: "شعار نخلة وسيفين" },
  { url: "/manus-storage/saudi-map-portrait_1fad012b.jpg", label: "رسم سعودي بخلفية خضراء" },
  { url: "/manus-storage/neutral-silhouette_230b7d3c.png", label: "صورة رمزية محايدة" },
] as const;
type AvatarKind = typeof avatarKinds[number];
type ProfileMode = "comment" | "rating-settings";

function getVisitorId() {
  const key = "ishraqa-anonymous-visitor";
  const known = localStorage.getItem(key);
  if (known) return known;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function AvatarArt({ kind, className }: { kind: AvatarKind; className?: string }) {
  const shapes: Record<AvatarKind, ReactNode> = {
    wave: <><path d="M5 28c7-12 14 12 22 0s14 12 22 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><circle cx="17" cy="15" r="4" fill="currentColor" opacity=".34" /></>,
    spark: <path d="M32 6l4.6 16.2L54 27l-17.4 4.8L32 48l-4.6-16.2L10 27l17.4-4.8L32 6z" fill="currentColor" />,
    leaf: <><path d="M12 47C12 19 32 9 53 9c0 23-12 42-37 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M14 46c10-10 18-18 30-30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></>,
    star: <path d="M32 7l6.2 17.5L57 25l-14.8 11.3L47 55 32 44.3 17 55l4.8-18.7L7 25l18.8-.5L32 7z" fill="currentColor" />,
  };
  return <svg className={className} viewBox="0 0 64 64" aria-hidden="true">{shapes[kind]}</svg>;
}

export default function ArticleComments({ pageKey, showLinkedRating = true }: { pageKey: string; showLinkedRating?: boolean }) {
  const [visitorId, setVisitorId] = useState<string>();
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [avatarKind, setAvatarKind] = useState<AvatarKind>("wave");
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMode, setProfileMode] = useState<ProfileMode>("comment");
  const [ratingPrivate, setRatingPrivate] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number>();
  const [commentPendingDeletion, setCommentPendingDeletion] = useState<number>();
  const [reactingTo, setReactingTo] = useState<Array<number | string>>([]);
  const [undoingCommentId, setUndoingCommentId] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [reportTarget, setReportTarget] = useState<{ type: "comment" | "reply"; id: number }>();
  const [reportReason, setReportReason] = useState<"abuse" | "illegal" | "profile" | "name" | "other">("abuse");
  const [reportDetails, setReportDetails] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; parentReplyId?: number | null; label: string }>();
  const [replyDisplayName, setReplyDisplayName] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const utils = trpc.useUtils();
  const comments = trpc.interactions.listComments.useQuery({ pageKey, visitorId });
  const feedback = trpc.interactions.articleFeedback.useQuery({ pageKey, visitorId });
  const updateFeedback = trpc.interactions.submitArticleFeedback.useMutation({ onSuccess: () => { void feedback.refetch(); void comments.refetch(); } });
  const undoPublishedComment = trpc.interactions.deleteComment.useMutation({ onSuccess: result => {
    if (result.deleted) { setStatus("تم التراجع عن نشر تعليقك."); void comments.refetch(); }
    else setStatus("تعذر التراجع لأن التعليق لم يعد متاحًا ضمن ملكيتك.");
    setUndoingCommentId(undefined);
  }, onError: () => { setUndoingCommentId(undefined); setStatus("تعذر التراجع الآن. يمكنك حذف التعليق من خياراته."); } });
  const submit = trpc.interactions.submitComment.useMutation({ onSuccess: result => {
    if (result.accepted) {
      clearEditor();
      setProfileOpen(false);
      setStatus("تم نشر تعليقك.");
      void comments.refetch();
      void feedback.refetch();
      if (result.commentId && visitorId) {
        toast.success("تم نشر تعليقك.", { action: { label: "تراجع", onClick: () => {
          setUndoingCommentId(result.commentId ?? undefined);
          undoPublishedComment.mutate({ commentId: result.commentId!, visitorId });
        } } });
      }
    }
    else setStatus(result.reason === "active-comment-exists" ? "لديك تعليق منشور بالفعل. احذفه أولًا قبل إضافة تعليق جديد." : "تعذر نشر التعليق لأن الصياغة تحتاج تعديلًا بسيطًا.");
  } });
  const update = trpc.interactions.updateComment.useMutation({ onSuccess: result => {
    if (result.updated) { clearEditor(); setProfileOpen(false); setStatus("تم تحديث تعليقك ونشر التعديل الآن."); void comments.refetch(); void feedback.refetch(); }
    else setStatus(result.reason === "content-not-allowed" ? "تعذر تحديث التعليق لأن الصياغة تحتاج تعديلًا بسيطًا." : "تعذر العثور على تعليقك لتحديثه.");
  } });
  const remove = trpc.interactions.deleteComment.useMutation({ onSuccess: result => {
    setCommentPendingDeletion(undefined);
    setStatus(result.deleted ? "حُذف تعليقك. يمكنك إضافة تعليق جديد متى أردت." : "تعذر حذف التعليق لأنه لم يعد متاحًا ضمن ملكيتك.");
    void comments.refetch();
  } });
  const react = trpc.interactions.react.useMutation({
    onError: () => { void comments.refetch(); },
    onSettled: (_value, _error, variables) => {
      setReactingTo(current => current.filter(id => id !== variables.commentId));
      void comments.refetch();
    },
  });
  const report = trpc.interactions.reportContent.useMutation({
    onSuccess: result => {
      setReportTarget(undefined);
      setReportDetails("");
      toast.success(result.created ? "تم استلام البلاغ ومراجعته آليًا. ستصلك النتيجة في مركز الإشعارات." : "سبق إرسال بلاغك عن هذه المساهمة، وستظهر النتيجة في مركز الإشعارات.");
    },
    onError: () => toast.error("تعذر إرسال البلاغ الآن. يرجى المحاولة لاحقًا."),
  });
  const submitReply = trpc.interactions.submitReply.useMutation({
    onSuccess: result => {
      if (result.accepted) {
        setReplyTarget(undefined);
        setReplyBody("");
        setStatus("تم نشر ردك وإشعار صاحب المساهمة.");
        void comments.refetch();
      } else {
        setStatus(result.reason === "reply-rate-limited" ? "يمكنك إعادة إرسال الرد نفسه على هذه الرسالة بعد ساعة لتقليل التكرار." : "تعذر نشر الرد لأن الصياغة تحتاج تعديلًا بسيطًا أو لأن المساهمة لم تعد متاحة.");
      }
    },
    onError: () => setStatus("تعذر إرسال الرد الآن. يرجى المحاولة لاحقًا."),
  });
  const reactToReply = trpc.interactions.reactToReply.useMutation({
    onError: () => { void comments.refetch(); },
    onSettled: (_value, _error, variables) => {
      setReactingTo(current => current.filter(id => id !== `reply:${variables.replyId}`));
      void comments.refetch();
    },
  });

  useEffect(() => setVisitorId(getVisitorId()), []);
  useEffect(() => { if (feedback.data) setRatingPrivate(!feedback.data.ownIsPublic); }, [feedback.data]);
  const ownComment = comments.data?.find(comment => comment.isOwner);
  const isWorking = submit.isPending || update.isPending || updateFeedback.isPending;

  function clearEditor() { setBody(""); setAvatarPreview(undefined); setEditingCommentId(undefined); }
  function openRatingSettings() { if (!feedback.data?.ownRating) return; setProfileMode("rating-settings"); setStatus(undefined); setProfileOpen(true); }
  function openProfile(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!visitorId || ownComment || body.trim().length < 4) return; setStatus(undefined); setEditingCommentId(undefined); setProfileMode("comment"); setProfileOpen(true); }
  async function publishWithProfile() {
    if (!visitorId) return;
    if (profileMode === "rating-settings") {
      if (!feedback.data?.ownRating) return;
      await updateFeedback.mutateAsync({ pageKey, visitorId, rating: feedback.data.ownRating, isPublic: !ratingPrivate });
      setProfileOpen(false);
      setStatus(ratingPrivate ? "سيبقى تقييمك محفوظًا لكنه مخفي عن الزوار." : "أصبح تقييمك ظاهرًا للزوار ويمكن عرضه بجانب تعليقك.");
      return;
    }
    if (displayName.trim().length < 2 || body.trim().length < 4) return;
    setStatus(undefined);
    try {
      if (showLinkedRating && feedback.data?.ownRating) await updateFeedback.mutateAsync({ pageKey, visitorId, rating: feedback.data.ownRating, isPublic: !ratingPrivate });
      const payload = { pageKey, visitorId, displayName: displayName.trim(), body: body.trim(), avatarKind, avatarUrl: avatarPreview };
      if (editingCommentId) update.mutate({ ...payload, commentId: editingCommentId }); else submit.mutate(payload);
    } catch { setStatus("تعذر حفظ إعدادات الملف الشخصي الآن. يمكنك المحاولة لاحقًا."); }
  }
  function startEdit() {
    if (!ownComment) return;
    setEditingCommentId(ownComment.id);
    setDisplayName(ownComment.displayName);
    setBody(ownComment.body);
    setAvatarPreview(ownComment.avatarUrl || undefined);
    setAvatarKind(avatarKinds.includes(ownComment.avatarKind as AvatarKind) ? ownComment.avatarKind as AvatarKind : "wave");
    setProfileMode("comment");
    setProfileOpen(true);
  }
  function toggleReaction(commentId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") {
    const reactionKey = `comment:${commentId}`;
    if (!visitorId || reactingTo.includes(reactionKey)) return;
    const reaction = nextReaction(current, requested);
    setReactingTo(items => [...items, commentId]);
    utils.interactions.listComments.setData({ pageKey, visitorId }, existing => existing?.map(comment => comment.id !== commentId ? comment : {
      ...comment,
      viewerReaction: reaction,
      hearts: Math.max(0, comment.hearts + (reaction === "heart" ? 1 : 0) - (current === "heart" ? 1 : 0)),
      broken: Math.max(0, comment.broken + (reaction === "broken" ? 1 : 0) - (current === "broken" ? 1 : 0)),
    }));
    react.mutate({ commentId, visitorId, reaction });
  }
  function openReply(commentId: number, parentReplyId: number | null | undefined, label: string) {
    setReplyTarget({ commentId, parentReplyId, label });
    setReplyDisplayName(ownComment?.displayName || displayName);
    setReplyBody("");
  }
  function toggleReplyReaction(replyId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") {
    const reactionKey = `reply:${replyId}`;
    if (!visitorId || reactingTo.includes(reactionKey)) return;
    setReactingTo(items => [...items, reactionKey]);
    reactToReply.mutate({ replyId, visitorId, reaction: nextReaction(current, requested) });
  }
  function publishReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visitorId || !replyTarget || replyDisplayName.trim().length < 2 || replyBody.trim().length < 4) return;
    submitReply.mutate({ pageKey, visitorId, commentId: replyTarget.commentId, parentReplyId: replyTarget.parentReplyId ?? null, displayName: replyDisplayName.trim(), body: replyBody.trim(), avatarKind, avatarUrl: avatarPreview });
  }

  const dialogTitle = profileMode === "rating-settings" ? "إعدادات تقييمك" : editingCommentId ? "تعديل تعليقك" : "قبل نشر تعليقك";
  return <section className="article-comments" aria-labelledby="comments-heading">
    <div className="article-comments-head"><h2 id="comments-heading">أضف تعليقًا</h2><p>شارك سؤالك أو ملاحظتك المرتبطة بالصفحة. التعليق مستقل عن تقييم النجوم.</p>{showLinkedRating && feedback.data?.ownRating && <button type="button" className="comment-owner-action rating-settings-action" onClick={openRatingSettings}><Pencil size={15} /> إعداد ظهور تقييمي</button>}</div>
    {ownComment ? <div className="comment-owner-panel"><p>لديك تعليق واحد منشور في هذه الصفحة. يمكنك تعديله أو حذفه قبل إضافة تعليق جديد.</p><div><button type="button" className="comment-owner-action" onClick={startEdit}><Pencil size={15} /> تعديل تعليقي</button><button type="button" className="comment-owner-action danger" disabled={remove.isPending || !visitorId} onClick={() => setCommentPendingDeletion(ownComment.id)}><Trash2 size={15} /> حذف تعليقي</button></div></div> : <form className="comment-form" onSubmit={openProfile}><label>تعليقك<textarea value={body} onChange={event => setBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب سؤالًا أو تجربة مرتبطة بالصفحة…" required /></label><button className="button" type="submit" disabled={!visitorId || isWorking}><Send size={16} /> أضف تعليقًا</button></form>}
    {status && <p className="comment-status" role="status">{status}</p>}
    <div className="comment-list" aria-live="polite">
      {comments.isLoading && <p className="comment-empty">جارٍ تحميل التعليقات المنشورة…</p>}
      {!comments.isLoading && !comments.data?.length && <p className="comment-empty"><MessageCircle size={19} /> لا توجد تعليقات بعد. كن أول من يضيف رأيًا حقيقيًا.</p>}
      {comments.data?.map(comment => <article className="comment-card" key={comment.id}><div className="comment-avatar" aria-hidden="true">{comment.avatarUrl ? <img src={comment.avatarUrl} alt="" loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(comment.avatarKind as AvatarKind) ? comment.avatarKind as AvatarKind : "wave"} />}</div><div className="comment-copy"><strong>{comment.displayName}</strong>{showLinkedRating && comment.rating && <span className="comment-rating" aria-label={`تقييم ${comment.rating} من 5`}><Star size={14} fill="currentColor" /> {comment.rating}/5</span>}<p>{comment.body}</p><div className="comment-reactions"><button type="button" className={`${comment.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(comment.id) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "heart")} aria-pressed={comment.viewerReaction === "heart"} aria-label="أعجبني التعليق"><Heart size={17} fill="currentColor" /> <span>{comment.hearts}</span></button><button type="button" className={`${comment.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(comment.id) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "broken")} aria-pressed={comment.viewerReaction === "broken"} aria-label="لم يعجبني التعليق"><HeartCrack size={17} /> <span>{comment.broken}</span></button><button type="button" className="comment-report-action" disabled={!visitorId} onClick={() => { setReportReason("abuse"); setReportDetails(""); setReportTarget({ type: "comment", id: comment.id }); }}><Flag size={15} /> إبلاغ</button></div></div></article>)}
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="comment-profile-dialog" dir="rtl"><DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{profileMode === "rating-settings" ? "غيّر ظهور تقييمك متى أردت. يبقى التقييم محفوظًا حتى عندما تختار إخفاءه." : "اختر اسم العرض وصورة شخصية من الخيارات المعتمدة، ثم انشر تعليقك."}</DialogDescription></DialogHeader>{profileMode === "rating-settings" ? <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي للعامة.</label> : <div className="comment-profile-fields"><label>اسم العرض<input value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={64} placeholder="مثال: أحمد من الرياض" required /></label><div className="profile-avatar-picker"><span>صورة الملف الشخصي <small>اختيارية</small></span><div className="profile-avatar-preview">{avatarPreview ? <img src={avatarPreview} alt="معاينة صورة الملف الشخصي" /> : <AvatarArt kind={avatarKind} />}</div><div className="ready-avatar-options"><span>اختر صورة جاهزة</span><div>{readyAvatarOptions.map(avatar => <button type="button" key={avatar.url} className={avatarPreview === avatar.url ? "active" : ""} onClick={() => setAvatarPreview(avatar.url)} aria-label={avatar.label}><img src={avatar.url} alt="" /></button>)}</div></div></div>{showLinkedRating && feedback.data?.ownRating && <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي بجانب تعليقي.</label>}</div>}<DialogFooter><button type="button" className="button ghost" onClick={() => setProfileOpen(false)}>إلغاء</button><button type="button" className="button" disabled={isWorking || (profileMode === "comment" && (displayName.trim().length < 2 || body.trim().length < 4))} onClick={publishWithProfile}>{isWorking ? "جارٍ الحفظ…" : profileMode === "rating-settings" ? "حفظ إعدادات التقييم" : editingCommentId ? "حفظ التعديل" : "نشر التعليق"}</button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(commentPendingDeletion)} onOpenChange={open => { if (!open && !remove.isPending) setCommentPendingDeletion(undefined); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف تعليقك؟</AlertDialogTitle><AlertDialogDescription>سيُحذف تعليقك من الصفحة، وستتمكن من كتابة تعليق جديد بعد الحذف.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-700 text-white hover:bg-red-800" disabled={remove.isPending || !visitorId} onClick={event => { event.preventDefault(); if (commentPendingDeletion && visitorId) remove.mutate({ commentId: commentPendingDeletion, visitorId }); }}>{remove.isPending ? "جارٍ الحذف…" : "حذف التعليق"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={Boolean(reportTarget)} onOpenChange={open => { if (!open && !report.isPending) setReportTarget(undefined); }}><DialogContent className="comment-report-dialog" dir="rtl"><DialogHeader><DialogTitle>الإبلاغ عن محتوى</DialogTitle><DialogDescription>اقرأ المراجعة الآلية النص والاسم وصورة الملف الشخصي عند وجودها. لا يُحذف المحتوى ولا يُقيَّد صاحبه إلا عند تأكيد مخالفة فعلية.</DialogDescription></DialogHeader><div className="comment-report-fields"><label>سبب الإبلاغ<select value={reportReason} onChange={event => setReportReason(event.target.value as typeof reportReason)}><option value="abuse">إساءة أو مضايقة</option><option value="illegal">محتوى غير قانوني</option><option value="profile">صورة ملف غير مناسبة</option><option value="name">اسم عرض غير مناسب</option><option value="other">سبب آخر</option></select></label><label>تفاصيل إضافية <small>اختياري</small><textarea value={reportDetails} onChange={event => setReportDetails(event.target.value)} maxLength={700} placeholder="اشرح سبب بلاغك باختصار…" /></label></div><DialogFooter><button type="button" className="button ghost" disabled={report.isPending} onClick={() => setReportTarget(undefined)}>إلغاء</button><button type="button" className="button" disabled={!visitorId || !reportTarget || report.isPending} onClick={() => visitorId && reportTarget && report.mutate({ reporterVisitorId: visitorId, targetType: reportTarget.type, targetId: reportTarget.id, reason: reportReason, details: reportDetails.trim() || undefined })}>{report.isPending ? "جارٍ الإرسال…" : "إرسال البلاغ"}</button></DialogFooter></DialogContent></Dialog>
    <div className="comment-reply-threads" aria-label="ردود التعليقات">
      {comments.data?.map(comment => <section className="comment-reply-thread" key={`thread-${comment.id}`}>
        <div className="comment-reply-thread-head"><span>الردود على تعليق {comment.displayName}</span><button type="button" className="comment-reply-action" disabled={!visitorId} onClick={() => openReply(comment.id, null, comment.displayName)}><MessageCircle size={15} /> رد</button></div>
        {!comment.replies?.length && <p className="comment-reply-empty">لا توجد ردود بعد.</p>}
        {comment.replies?.map(reply => <article className={`comment-reply-card ${reply.parentReplyId ? "is-nested" : ""}`} key={reply.id}>
          <div className="comment-avatar comment-reply-avatar" aria-hidden="true">{reply.avatarUrl ? <img src={reply.avatarUrl} alt="" loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(reply.avatarKind as AvatarKind) ? reply.avatarKind as AvatarKind : "wave"} />}</div>
          <div className="comment-copy"><strong>{reply.displayName}</strong><time className="comment-date" dateTime={new Date(reply.createdAt).toISOString()}>{new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(reply.createdAt))}</time><p>{reply.body}</p>
            <div className="comment-reactions"><button type="button" className={`${reply.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(`reply:${reply.id}`) ? "is-reacting" : ""}`} onClick={() => toggleReplyReaction(reply.id, reply.viewerReaction, "heart")} aria-pressed={reply.viewerReaction === "heart"} aria-label="أعجبني الرد"><Heart size={16} fill="currentColor" /> <span>{reply.hearts}</span></button><button type="button" className={`${reply.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(`reply:${reply.id}`) ? "is-reacting" : ""}`} onClick={() => toggleReplyReaction(reply.id, reply.viewerReaction, "broken")} aria-pressed={reply.viewerReaction === "broken"} aria-label="لم يعجبني الرد"><HeartCrack size={16} /> <span>{reply.broken}</span></button><button type="button" className="comment-reply-action" disabled={!visitorId} onClick={() => openReply(comment.id, reply.id, reply.displayName)}><MessageCircle size={14} /> رد</button><button type="button" className="comment-report-action" disabled={!visitorId} onClick={() => { setReportReason("abuse"); setReportDetails(""); setReportTarget({ type: "reply", id: reply.id }); }}><Flag size={15} /> إبلاغ</button></div>
          </div>
        </article>)}
      </section>)}
      {replyTarget && <form className="comment-reply-form" onSubmit={publishReply}><div><strong>رد على {replyTarget.label}</strong><button type="button" onClick={() => setReplyTarget(undefined)}>إلغاء</button></div><label>اسم العرض<input value={replyDisplayName} onChange={event => setReplyDisplayName(event.target.value)} minLength={2} maxLength={64} placeholder="مثال: أحمد من الرياض" required /></label><label>ردك<textarea value={replyBody} onChange={event => setReplyBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب ردًا مفيدًا ومحترمًا…" required /></label><button className="button" type="submit" disabled={submitReply.isPending || !visitorId || replyDisplayName.trim().length < 2 || replyBody.trim().length < 4}><Send size={16} /> {submitReply.isPending ? "جارٍ النشر…" : "نشر الرد"}</button></form>}
    </div>
  </section>;
}
