import { CornerUpLeft, Heart, HeartCrack, MessageCircle, Pencil, Send, Star, Trash2 } from "lucide-react";
import React, { FormEvent, ReactNode, useEffect, useState } from "react";
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
type ProfileMode = "comment" | "rating-settings" | "reply";
type ReplyTarget = { commentId: number; parentReplyId?: number | null; recipient: string };

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
  const [reactingTo, setReactingTo] = useState<string[]>([]);
  const [undoingCommentId, setUndoingCommentId] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>();
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
      setReactingTo(current => current.filter(id => id !== `comment-${variables.commentId}`));
      void comments.refetch();
    },
  });
  const submitReply = trpc.interactions.submitReply.useMutation({ onSuccess: result => {
    if (result.accepted) {
      setReplyBody("");
      setReplyTarget(undefined);
      setProfileOpen(false);
      setStatus("تم نشر ردك.");
      void comments.refetch();
      return;
    }
    if (result.reason === "reply-rate-limited") {
      const minutes = Math.max(1, Math.ceil((result.retryAfterSeconds ?? 0) / 60));
      setStatus(`يمكنك إرسال رد آخر على هذه الرسالة بعد ${minutes} دقيقة حفاظًا على جودة الحوار.`);
      return;
    }
    setStatus(result.reason === "content-not-allowed" ? "تعذر نشر الرد لأن الصياغة تحتاج تعديلًا بسيطًا." : "لم تعد الرسالة متاحة للرد الآن.");
  } });
  const reactToReply = trpc.interactions.reactToReply.useMutation({
    onError: () => { void comments.refetch(); },
    onSettled: (_value, _error, variables) => {
      setReactingTo(current => current.filter(id => id !== `reply-${variables.replyId}`));
      void comments.refetch();
    },
  });

  useEffect(() => setVisitorId(getVisitorId()), []);
  useEffect(() => { if (feedback.data) setRatingPrivate(!feedback.data.ownIsPublic); }, [feedback.data]);
  const ownComment = comments.data?.find(comment => comment.isOwner);
  const isWorking = submit.isPending || update.isPending || submitReply.isPending || updateFeedback.isPending;

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
    if (displayName.trim().length < 2 || (profileMode === "reply" ? replyBody.trim().length < 4 : body.trim().length < 4)) return;
    setStatus(undefined);
    try {
      if (profileMode === "reply") {
        if (!replyTarget) return;
        submitReply.mutate({ pageKey, visitorId, displayName: displayName.trim(), body: replyBody.trim(), avatarKind, avatarUrl: avatarPreview, commentId: replyTarget.commentId, parentReplyId: replyTarget.parentReplyId ?? null });
        return;
      }
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
    const key = `comment-${commentId}`;
    if (!visitorId || reactingTo.includes(key)) return;
    const reaction = nextReaction(current, requested);
    setReactingTo(items => [...items, key]);
    utils.interactions.listComments.setData({ pageKey, visitorId }, existing => existing?.map(comment => comment.id !== commentId ? comment : {
      ...comment,
      viewerReaction: reaction,
      hearts: Math.max(0, comment.hearts + (reaction === "heart" ? 1 : 0) - (current === "heart" ? 1 : 0)),
      broken: Math.max(0, comment.broken + (reaction === "broken" ? 1 : 0) - (current === "broken" ? 1 : 0)),
    }));
    react.mutate({ commentId, visitorId, reaction });
  }
  function toggleReplyReaction(replyId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") {
    const key = `reply-${replyId}`;
    if (!visitorId || reactingTo.includes(key)) return;
    setReactingTo(items => [...items, key]);
    reactToReply.mutate({ replyId, visitorId, reaction: nextReaction(current, requested) });
  }
  function openReply(target: ReplyTarget) {
    if (!visitorId) return;
    setReplyTarget(target);
    setReplyBody("");
    setProfileMode("reply");
    setStatus(undefined);
    setProfileOpen(true);
  }
  function toPublishedIso(value?: Date | string | null) {
    const date = value ? new Date(value) : undefined;
    return date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined;
  }
  function formatPublishedAt(value?: Date | string | null) {
    const date = value ? new Date(value) : undefined;
    return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { dateStyle: "medium", timeStyle: "short" }).format(date) : "تاريخ النشر قيد التحديث";
  }
  function renderReply(reply: any, commentId: number, level = 1): ReactNode {
    const reactionKey = `reply-${reply.id}`;
    return <article className="comment-reply" data-depth={Math.min(level, 2)} key={reply.id}>
      <div className="comment-avatar" aria-hidden="true">{reply.avatarUrl ? <img src={reply.avatarUrl} alt="" loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(reply.avatarKind as AvatarKind) ? reply.avatarKind as AvatarKind : "wave"} />}</div>
      <div className="comment-copy"><div className="comment-meta"><strong>{reply.displayName}</strong><time dateTime={toPublishedIso(reply.createdAt)}>نُشر في {formatPublishedAt(reply.createdAt)}</time></div><p>{reply.body}</p><div className="comment-reactions"><button type="button" className={`${reply.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(reactionKey) ? "is-reacting" : ""}`} onClick={() => toggleReplyReaction(reply.id, reply.viewerReaction, "heart")} aria-pressed={reply.viewerReaction === "heart"} aria-label="أعجبني الرد"><Heart size={15} fill="currentColor" /> <span>{reply.hearts}</span></button><button type="button" className={`${reply.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(reactionKey) ? "is-reacting" : ""}`} onClick={() => toggleReplyReaction(reply.id, reply.viewerReaction, "broken")} aria-pressed={reply.viewerReaction === "broken"} aria-label="لم يعجبني الرد"><HeartCrack size={15} /> <span>{reply.broken}</span></button><button type="button" className="comment-reply-button" onClick={() => openReply({ commentId, parentReplyId: reply.id, recipient: reply.displayName })}><CornerUpLeft size={15} /> رد</button></div>{reply.replies?.map((child: any) => renderReply(child, commentId, level + 1))}</div>
    </article>;
  }

  const dialogTitle = profileMode === "rating-settings" ? "إعدادات تقييمك" : profileMode === "reply" ? `الرد على ${replyTarget?.recipient ?? "التعليق"}` : editingCommentId ? "تعديل تعليقك" : "قبل نشر تعليقك";
  return <section className="article-comments" aria-labelledby="comments-heading">
    <div className="article-comments-head"><h2 id="comments-heading">أضف تعليقًا</h2><p>شارك سؤالك أو ملاحظتك المرتبطة بالصفحة. التعليق مستقل عن تقييم النجوم.</p>{showLinkedRating && feedback.data?.ownRating && <button type="button" className="comment-owner-action rating-settings-action" onClick={openRatingSettings}><Pencil size={15} /> إعداد ظهور تقييمي</button>}</div>
    {ownComment ? <div className="comment-owner-panel"><p>لديك تعليق واحد منشور في هذه الصفحة. يمكنك تعديله أو حذفه قبل إضافة تعليق جديد.</p><div><button type="button" className="comment-owner-action" onClick={startEdit}><Pencil size={15} /> تعديل تعليقي</button><button type="button" className="comment-owner-action danger" disabled={remove.isPending || !visitorId} onClick={() => setCommentPendingDeletion(ownComment.id)}><Trash2 size={15} /> حذف تعليقي</button></div></div> : <form className="comment-form" onSubmit={openProfile}><label>تعليقك<textarea value={body} onChange={event => setBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب سؤالًا أو تجربة مرتبطة بالصفحة…" required /></label><button className="button" type="submit" disabled={!visitorId || isWorking}><Send size={16} /> أضف تعليقًا</button></form>}
    {status && <p className="comment-status" role="status">{status}</p>}
    <div className="comment-list" aria-live="polite">
      {comments.isLoading && <p className="comment-empty">جارٍ تحميل التعليقات المنشورة…</p>}
      {!comments.isLoading && !comments.data?.length && <p className="comment-empty"><MessageCircle size={19} /> لا توجد تعليقات بعد. كن أول من يضيف رأيًا حقيقيًا.</p>}
      {comments.data?.map(comment => <article className="comment-card" key={comment.id}><div className="comment-avatar" aria-hidden="true">{comment.avatarUrl ? <img src={comment.avatarUrl} alt="" loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(comment.avatarKind as AvatarKind) ? comment.avatarKind as AvatarKind : "wave"} />}</div><div className="comment-copy"><div className="comment-meta"><strong>{comment.displayName}</strong><time dateTime={toPublishedIso(comment.createdAt)}>نُشر في {formatPublishedAt(comment.createdAt)}</time></div>{showLinkedRating && comment.rating && <span className="comment-rating" aria-label={`تقييم ${comment.rating} من 5`}><Star size={14} fill="currentColor" /> {comment.rating}/5</span>}<p>{comment.body}</p><div className="comment-reactions"><button type="button" className={`${comment.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(`comment-${comment.id}`) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "heart")} aria-pressed={comment.viewerReaction === "heart"} aria-label="أعجبني التعليق"><Heart size={17} fill="currentColor" /> <span>{comment.hearts}</span></button><button type="button" className={`${comment.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(`comment-${comment.id}`) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "broken")} aria-pressed={comment.viewerReaction === "broken"} aria-label="لم يعجبني التعليق"><HeartCrack size={17} /> <span>{comment.broken}</span></button><button type="button" className="comment-reply-button" onClick={() => openReply({ commentId: comment.id, recipient: comment.displayName })}><CornerUpLeft size={15} /> رد</button></div>{comment.replies?.map((reply: any) => renderReply(reply, comment.id))}</div></article>)}
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="comment-profile-dialog" dir="rtl"><DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{profileMode === "rating-settings" ? "غيّر ظهور تقييمك متى أردت. يبقى التقييم محفوظًا حتى عندما تختار إخفاءه." : profileMode === "reply" ? "يمكنك الرد مرة واحدة على الرسالة نفسها خلال ساعة، ثم يتاح رد جديد بعد انتهاء المهلة." : "اختر اسم العرض وصورة شخصية من الخيارات المعتمدة، ثم انشر تعليقك."}</DialogDescription></DialogHeader>{profileMode === "rating-settings" ? <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي للعامة.</label> : <div className="comment-profile-fields"><label>اسم العرض<input value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={64} placeholder="مثال: أحمد من الرياض" required /></label>{profileMode === "reply" && <label>ردك<textarea value={replyBody} onChange={event => setReplyBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب ردًا مفيدًا ومرتبطًا بالتعليق…" required /></label>}<div className="profile-avatar-picker"><span>صورة الملف الشخصي <small>اختيارية</small></span><div className="profile-avatar-preview">{avatarPreview ? <img src={avatarPreview} alt="معاينة صورة الملف الشخصي" /> : <AvatarArt kind={avatarKind} />}</div><div className="ready-avatar-options"><span>اختر صورة جاهزة</span><div>{readyAvatarOptions.map(avatar => <button type="button" key={avatar.url} className={avatarPreview === avatar.url ? "active" : ""} onClick={() => setAvatarPreview(avatar.url)} aria-label={avatar.label}><img src={avatar.url} alt="" /></button>)}</div></div></div>{showLinkedRating && feedback.data?.ownRating && profileMode === "comment" && <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي بجانب تعليقي.</label>}</div>}<DialogFooter><button type="button" className="button ghost" onClick={() => setProfileOpen(false)}>إلغاء</button><button type="button" className="button" disabled={isWorking || (profileMode !== "rating-settings" && (displayName.trim().length < 2 || (profileMode === "reply" ? replyBody.trim().length < 4 : body.trim().length < 4)))} onClick={publishWithProfile}>{isWorking ? "جارٍ الحفظ…" : profileMode === "rating-settings" ? "حفظ إعدادات التقييم" : profileMode === "reply" ? "نشر الرد" : editingCommentId ? "حفظ التعديل" : "نشر التعليق"}</button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(commentPendingDeletion)} onOpenChange={open => { if (!open && !remove.isPending) setCommentPendingDeletion(undefined); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف تعليقك؟</AlertDialogTitle><AlertDialogDescription>سيُحذف تعليقك من الصفحة، وستتمكن من كتابة تعليق جديد بعد الحذف.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-700 text-white hover:bg-red-800" disabled={remove.isPending || !visitorId} onClick={event => { event.preventDefault(); if (commentPendingDeletion && visitorId) remove.mutate({ commentId: commentPendingDeletion, visitorId }); }}>{remove.isPending ? "جارٍ الحذف…" : "حذف التعليق"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
