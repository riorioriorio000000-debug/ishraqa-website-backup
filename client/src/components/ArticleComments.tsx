import React, { FormEvent, ReactNode, useEffect, useState } from "react";
import { Flag, Heart, HeartCrack, MessageCircle, Pencil, Send, Star, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { nextReaction } from "@shared/interactionHelpers";
import { toast } from "sonner";

const avatarKinds = ["wave", "spark", "leaf", "star"] as const;
const COMMENT_PROFILE_STORAGE_KEY = "ishraqa-comment-profile";
const readyAvatarOptions = [
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "أعلام السعودية في الرياض" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "مسافر سعودي" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "صورة شخصية سعودية بالأبيض والأسود" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "مشهد صحراوي سعودي" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "صورة تراثية سعودية" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "شعار نخلة وسيفين" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "رسم سعودي بخلفية خضراء" },
  { url: "/ishraqa-website-backup/media/sofa.jpg", label: "صورة رمزية محايدة" },
] as const;
type AvatarKind = typeof avatarKinds[number];
type ProfileMode = "comment" | "reply" | "rating-settings";
const COMMENT_BODY_MAX_LENGTH = 500;
const DISPLAY_NAME_MAX_LENGTH = 32;
const REPORT_DETAILS_MAX_LENGTH = 350;

function inferReportReason(details: string): "abuse" | "illegal" | "profile" | "name" | "other" {
  const normalized = details.trim().toLowerCase();
  if (/صورة|بروفايل|ملف شخصي|رمزية/.test(normalized)) return "profile";
  if (/اسم|لقب/.test(normalized)) return "name";
  if (/قانون|ممنوع|جريمة|احتيال/.test(normalized)) return "illegal";
  if (/إساءة|اساءة|مضايقة|تهديد|كراهية|شتم/.test(normalized)) return "abuse";
  return "other";
}

function getVisitorId() {
  const key = "ishraqa-anonymous-visitor";
  const known = localStorage.getItem(key);
  if (known) return known;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function formatContributionDate(value: Date | string | number) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "منذ قليل" : new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function contributionDateTime(value: Date | string | number) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
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

export default function ArticleComments({ pageKey, showLinkedRating = true, sectionId = "comments", showSortControls = false, onCommentPublished, suppressSuccessToast = false }: { pageKey: string; showLinkedRating?: boolean; sectionId?: string; showSortControls?: boolean; onCommentPublished?: () => void; suppressSuccessToast?: boolean }) {
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
  const [replyPendingDeletion, setReplyPendingDeletion] = useState<number>();
  const [replyUndoTarget, setReplyUndoTarget] = useState<number>();
  const [editingReplyId, setEditingReplyId] = useState<number>();
  const [editReplyBody, setEditReplyBody] = useState("");
  const [reactingTo, setReactingTo] = useState<Array<number | string>>([]);
  const [undoingCommentId, setUndoingCommentId] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [reportTarget, setReportTarget] = useState<{ type: "comment" | "reply"; id: number }>();
  const [reportDetails, setReportDetails] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; parentReplyId?: number | null; label: string }>();
  const [replyBody, setReplyBody] = useState("");
  const [expandedReplyThreads, setExpandedReplyThreads] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "engagement">("newest");

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
      persistVisitorProfile();
      clearEditor();
      setProfileOpen(false);
      setStatus("تم نشر تعليقك.");
      onCommentPublished?.();
      void comments.refetch();
      void feedback.refetch();
      if (result.commentId && visitorId && !suppressSuccessToast) {
        toast.success("تم نشر تعليقك.", { action: { label: "تراجع", onClick: () => {
          setUndoingCommentId(result.commentId ?? undefined);
          undoPublishedComment.mutate({ commentId: result.commentId!, visitorId });
        } } });
      }
    }
    else setStatus(result.reason === "active-comment-exists" ? "لديك تعليق منشور بالفعل. احذفه أولًا قبل إضافة تعليق جديد." : "تعذر نشر التعليق لأن الصياغة تحتاج تعديلًا بسيطًا.");
  } });
  const update = trpc.interactions.updateComment.useMutation({ onSuccess: result => {
    if (result.updated) { persistVisitorProfile(); clearEditor(); setProfileOpen(false); setStatus("تم تحديث تعليقك ونشر التعديل الآن."); void comments.refetch(); void feedback.refetch(); }
    else setStatus(result.reason === "content-not-allowed" ? "تعذر تحديث التعليق لأن الصياغة تحتاج تعديلًا بسيطًا." : "تعذر العثور على تعليقك لتحديثه.");
  } });
  const remove = trpc.interactions.deleteComment.useMutation({ onSuccess: result => {
    setCommentPendingDeletion(undefined);
    setStatus(result.deleted ? "حُذف تعليقك. يمكنك إضافة تعليق جديد متى أردت." : "تعذر حذف التعليق لأنه لم يعد متاحًا ضمن ملكيتك.");
    void comments.refetch();
  } });
  const restoreReply = trpc.interactions.restoreReply.useMutation({
    onSuccess: result => {
      setReplyUndoTarget(undefined);
      if (result.restored) {
        setStatus("تمت استعادة ردك.");
        toast.success("تمت استعادة ردك.");
      } else {
        const message = result.reason === "undo-window-expired" ? "انتهت مهلة التراجع عن حذف الرد." : "تعذر استعادة الرد الآن.";
        setStatus(message);
        toast.error(message);
      }
      void comments.refetch();
    },
    onError: () => {
      setReplyUndoTarget(undefined);
      setStatus("تعذر استعادة الرد الآن. يرجى المحاولة لاحقًا.");
      toast.error("تعذر استعادة الرد الآن. يرجى المحاولة لاحقًا.");
    },
  });
  const updateReply = trpc.interactions.updateReply.useMutation({
    onSuccess: result => {
      if (result.updated) {
        setEditingReplyId(undefined);
        setEditReplyBody("");
        setStatus("تم حفظ تعديل ردك.");
        toast.success("تم حفظ تعديل ردك.");
        void comments.refetch();
        return;
      }
      const message = result.reason === "edit-window-expired" ? "انتهت مهلة تعديل الرد." : result.reason === "content-not-allowed" ? "تعذر حفظ التعديل لأن الصياغة تحتاج تعديلًا بسيطًا." : "تعذر العثور على ردك لتعديله.";
      setStatus(message);
      toast.error(message);
    },
    onError: () => {
      setStatus("تعذر حفظ تعديل الرد الآن. يرجى المحاولة لاحقًا.");
      toast.error("تعذر حفظ تعديل الرد الآن. يرجى المحاولة لاحقًا.");
    },
  });
  const removeReply = trpc.interactions.deleteReply.useMutation({
    onSuccess: (result, variables) => {
      setReplyPendingDeletion(undefined);
      if (result.deleted) {
        setStatus("حُذف ردك.");
        setReplyUndoTarget(variables.replyId);
        toast.success("تم حذف ردك.", {
          description: "يمكنك التراجع خلال 5 ثوانٍ.",
          duration: 5_000,
          action: {
            label: "تراجع",
            onClick: () => {
              if (visitorId) restoreReply.mutate({ replyId: variables.replyId, visitorId });
            },
          },
        });
      } else {
        setStatus("تعذر حذف الرد لأنه لم يعد متاحًا ضمن ملكيتك.");
      }
      void comments.refetch();
    },
    onError: () => {
      setReplyPendingDeletion(undefined);
      setStatus("تعذر حذف الرد الآن. يرجى المحاولة لاحقًا.");
    },
  });
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
        persistVisitorProfile();
        setReplyTarget(undefined);
        setReplyBody("");
        setProfileOpen(false);
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
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMMENT_PROFILE_STORAGE_KEY);
      if (!saved) return;
      const profile = JSON.parse(saved) as { displayName?: string; avatarUrl?: string };
      if (profile.displayName) setDisplayName(profile.displayName);
      if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);
    } catch {
      localStorage.removeItem(COMMENT_PROFILE_STORAGE_KEY);
    }
  }, []);
  useEffect(() => { if (feedback.data) setRatingPrivate(!feedback.data.ownIsPublic); }, [feedback.data]);
  useEffect(() => {
    if (!replyUndoTarget) return;
    const timeout = window.setTimeout(() => setReplyUndoTarget(undefined), 5_000);
    return () => window.clearTimeout(timeout);
  }, [replyUndoTarget]);
  const ownComment = comments.data?.find(comment => comment.isOwner);
  const sortedComments = [...(comments.data ?? [])].sort((first, second) => {
    if (sortOrder === "newest") return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    const engagementScore = (comment: typeof first) => comment.hearts + comment.broken + (comment.replies?.length ?? 0) + (comment.replies?.reduce((total, reply) => total + reply.hearts + reply.broken, 0) ?? 0);
    const scoreDifference = engagementScore(second) - engagementScore(first);
    return scoreDifference || new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });
  const isWorking = submit.isPending || update.isPending || updateFeedback.isPending || submitReply.isPending;

  function persistVisitorProfile(name = displayName) {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    localStorage.setItem(COMMENT_PROFILE_STORAGE_KEY, JSON.stringify({ displayName: trimmedName, avatarUrl: avatarPreview }));
  }
  function clearEditor() { setBody(""); setEditingCommentId(undefined); }
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
    if (profileMode === "reply") {
      if (!replyTarget || displayName.trim().length < 2 || displayName.trim().length > DISPLAY_NAME_MAX_LENGTH || replyBody.trim().length < 4 || replyBody.trim().length > COMMENT_BODY_MAX_LENGTH) return;
      setStatus(undefined);
      submitReply.mutate({ pageKey, visitorId, commentId: replyTarget.commentId, parentReplyId: replyTarget.parentReplyId ?? null, displayName: displayName.trim(), body: replyBody.trim(), avatarKind, avatarUrl: avatarPreview });
      return;
    }
    if (displayName.trim().length < 2 || displayName.trim().length > DISPLAY_NAME_MAX_LENGTH || body.trim().length < 4 || body.trim().length > COMMENT_BODY_MAX_LENGTH) return;
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
    setReplyBody("");
  }
  function cancelReply() {
    setReplyTarget(undefined);
    setReplyBody("");
  }
  function isReplyEditable(createdAt: Date | string | number) {
    const publishedAt = new Date(createdAt).getTime();
    return !Number.isNaN(publishedAt) && Date.now() - publishedAt <= 15 * 60 * 1_000;
  }
  function startReplyEdit(replyId: number, currentBody: string) {
    setReplyTarget(undefined);
    setReplyBody("");
    setEditingReplyId(replyId);
    setEditReplyBody(currentBody);
  }
  function cancelReplyEdit() {
    setEditingReplyId(undefined);
    setEditReplyBody("");
  }
  function submitReplyEdit(event: FormEvent<HTMLFormElement>, replyId: number) {
    event.preventDefault();
    if (!visitorId || editReplyBody.trim().length < 4 || editReplyBody.trim().length > COMMENT_BODY_MAX_LENGTH) return;
    updateReply.mutate({ replyId, visitorId, body: editReplyBody.trim() });
  }
  function toggleReplyReaction(replyId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") {
    const reactionKey = `reply:${replyId}`;
    if (!visitorId || reactingTo.includes(reactionKey)) return;
    setReactingTo(items => [...items, reactionKey]);
    reactToReply.mutate({ replyId, visitorId, reaction: nextReaction(current, requested) });
  }
  function publishReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visitorId || !replyTarget || replyBody.trim().length < 4 || replyBody.trim().length > COMMENT_BODY_MAX_LENGTH) return;
    setStatus(undefined);
    setProfileMode("reply");
    setProfileOpen(true);
  }
  function replyComposer(commentId: number, parentReplyId: number | null | undefined) {
    if (!replyTarget || replyTarget.commentId !== commentId || (replyTarget.parentReplyId ?? null) !== (parentReplyId ?? null)) return null;
    return <form className="comment-reply-form comment-reply-form-inline" onSubmit={publishReply}><div><strong>رد على {replyTarget.label}</strong><button type="button" onClick={cancelReply}>إلغاء</button></div><label>ردك<textarea value={replyBody} onChange={event => setReplyBody(event.target.value)} minLength={4} maxLength={COMMENT_BODY_MAX_LENGTH} placeholder="اكتب ردك…" required autoFocus /><small className="field-character-count" aria-hidden="true">{replyBody.length}/{COMMENT_BODY_MAX_LENGTH}</small></label><button className="button" type="submit" disabled={!visitorId || replyBody.trim().length < 4 || replyBody.trim().length > COMMENT_BODY_MAX_LENGTH}><Send size={16} /> نشر الرد</button></form>;
  }
  function replyThread(comment: NonNullable<typeof comments.data>[number]) {
    const replyCount = comment.replies?.length ?? 0;
    if (!replyCount) return null;
    const isExpanded = expandedReplyThreads.includes(comment.id);
    return <section className="comment-reply-thread comment-reply-thread-inline" aria-label={`ردود تعليق ${comment.displayName}`}>
      <button type="button" className="comment-reply-toggle" aria-expanded={isExpanded} aria-controls={`replies-${comment.id}`} onClick={() => setExpandedReplyThreads(current => current.includes(comment.id) ? current.filter(id => id !== comment.id) : [...current, comment.id])}>{isExpanded ? "إخفاء الردود" : `عرض الردود (${replyCount})`}</button>
      {isExpanded && <div id={`replies-${comment.id}`}>
        {comment.replies?.map(reply => <article id={`reply-${reply.id}`} className={`comment-reply-card ${reply.parentReplyId ? "is-nested" : ""}`} key={reply.id}>
          <div className="comment-avatar comment-reply-avatar">{reply.avatarUrl ? <img src={reply.avatarUrl} alt={`صورة رمزية لـ ${reply.displayName}`} loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(reply.avatarKind as AvatarKind) ? reply.avatarKind as AvatarKind : "wave"} />}</div>
          <div className="comment-copy"><strong>{reply.displayName}</strong><time className="comment-date" dateTime={contributionDateTime(reply.createdAt)}>{formatContributionDate(reply.createdAt)}</time>{editingReplyId === reply.id ? <form className="comment-reply-form comment-reply-edit-form" onSubmit={event => submitReplyEdit(event, reply.id)}><div><strong>تعديل ردك</strong><button type="button" onClick={cancelReplyEdit}>إلغاء</button></div><label>نص الرد<textarea value={editReplyBody} onChange={event => setEditReplyBody(event.target.value)} minLength={4} maxLength={COMMENT_BODY_MAX_LENGTH} required autoFocus /><small className="field-character-count" aria-hidden="true">{editReplyBody.length}/{COMMENT_BODY_MAX_LENGTH}</small></label><div className="comment-reply-form-actions"><button className="button" type="submit" disabled={updateReply.isPending || editReplyBody.trim().length < 4 || editReplyBody.trim().length > COMMENT_BODY_MAX_LENGTH}>{updateReply.isPending ? "جارٍ الحفظ…" : "حفظ التعديل"}</button></div></form> : <><p>{reply.body}</p>
            <div className="comment-reactions"><button type="button" className={`${reply.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(`reply:${reply.id}`) ? "is-reacting" : ""}`} onClick={() => toggleReplyReaction(reply.id, reply.viewerReaction, "heart")} aria-pressed={reply.viewerReaction === "heart"} aria-label="أعجبني الرد"><Heart size={16} fill="currentColor" /> <span>{reply.hearts}</span></button><button type="button" className={`${reply.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(`reply:${reply.id}`) ? "is-reacting" : ""}`} onClick={() => toggleReplyReaction(reply.id, reply.viewerReaction, "broken")} aria-pressed={reply.viewerReaction === "broken"} aria-label="لم يعجبني الرد"><HeartCrack size={16} /> <span>{reply.broken}</span></button><button type="button" className="comment-reply-action" disabled={!visitorId} onClick={() => openReply(comment.id, reply.id, reply.displayName)}><MessageCircle size={14} /> رد</button><button type="button" className="comment-report-action" disabled={!visitorId} onClick={() => { setReportDetails(""); setReportTarget({ type: "reply", id: reply.id }); }}><Flag size={15} /> إبلاغ</button>{reply.isOwner && isReplyEditable(reply.createdAt) && <button type="button" className="comment-reply-edit-action" disabled={updateReply.isPending || !visitorId} onClick={() => startReplyEdit(reply.id, reply.body)} aria-label="تعديل الرد"><Pencil size={14} /> تعديل</button>}{reply.isOwner && <button type="button" className="comment-reply-delete-action" disabled={removeReply.isPending || !visitorId} onClick={() => setReplyPendingDeletion(reply.id)} aria-label="حذف الرد"><Trash2 size={14} /> حذف</button>}</div></>}
            {replyComposer(comment.id, reply.id)}</div>
        </article>)}
      </div>}
    </section>;
  }

  const dialogTitle = profileMode === "rating-settings" ? "إعدادات تقييمك" : profileMode === "reply" ? "قبل نشر ردك" : editingCommentId ? "تعديل تعليقك" : "قبل نشر تعليقك";
  const profileDescription = profileMode === "rating-settings" ? "حدّد ظهور تقييمك." : profileMode === "reply" ? "اختر الاسم والصورة قبل نشر الرد، وستُحفظ لمرتك التالية." : "اختر الاسم والصورة، وستُحفظ لمرتك التالية.";
  const profileActionLabel = isWorking ? "جارٍ الحفظ…" : profileMode === "rating-settings" ? "حفظ إعدادات التقييم" : profileMode === "reply" ? "نشر الرد" : editingCommentId ? "حفظ التعديل" : "نشر التعليق";
  const profileActionDisabled = isWorking || ((profileMode === "comment" || profileMode === "reply") && (displayName.trim().length < 2 || displayName.trim().length > DISPLAY_NAME_MAX_LENGTH || (profileMode === "reply" ? replyBody : body).trim().length < 4 || (profileMode === "reply" ? replyBody : body).trim().length > COMMENT_BODY_MAX_LENGTH));
  useEffect(() => {
    if (typeof window === "undefined" || !comments.data?.length) return;
    const match = /^#(comment|reply)-(\d+)$/.exec(window.location.hash);
    if (!match) return;
    const [, entityType, entityId] = match;
    const commentWithReply = entityType === "reply" ? comments.data.find(comment => comment.replies?.some(reply => String(reply.id) === entityId)) : undefined;
    if (commentWithReply && !expandedReplyThreads.includes(commentWithReply.id)) {
      setExpandedReplyThreads(current => current.includes(commentWithReply!.id) ? current : [...current, commentWithReply!.id]);
      return;
    }
    const targetId = `${entityType}-${entityId}`;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      target.classList.add("comment-context-target");
      window.setTimeout(() => target.classList.remove("comment-context-target"), 3_000);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [comments.data, expandedReplyThreads]);
  return <section id={sectionId} className="article-comments" aria-labelledby="comments-heading">
    <div className="article-comments-head"><h2 id="comments-heading">أضف تعليقًا</h2><p>اكتب ملاحظتك المرتبطة بالصفحة.</p>{showLinkedRating && feedback.data?.ownRating && <button type="button" className="comment-owner-action rating-settings-action" onClick={openRatingSettings}><Pencil size={15} /> إعداد ظهور تقييمي</button>}</div>
    {ownComment ? <div className="comment-owner-panel"><p>لديك تعليق منشور هنا.</p><div><button type="button" className="comment-owner-action" onClick={startEdit}><Pencil size={15} /> تعديل تعليقي</button><button type="button" className="comment-owner-action danger" disabled={remove.isPending || !visitorId} onClick={() => setCommentPendingDeletion(ownComment.id)}><Trash2 size={15} /> حذف تعليقي</button></div></div> : <form className="comment-form" onSubmit={openProfile}><label>تعليقك<textarea value={body} onChange={event => setBody(event.target.value)} minLength={4} maxLength={COMMENT_BODY_MAX_LENGTH} placeholder="اكتب تعليقك…" required /><small className="field-character-count" aria-hidden="true">{body.length}/{COMMENT_BODY_MAX_LENGTH}</small></label><button className="button" type="submit" disabled={!visitorId || isWorking || body.trim().length > COMMENT_BODY_MAX_LENGTH}><Send size={16} /> أضف تعليقًا</button></form>}
    {status && <p className="comment-status" role="status">{status}</p>}
    <div className="comment-list" aria-live="polite">
      {showSortControls && <div className="comment-sort-controls" aria-label="فرز تعليقات الفيديو"><span>فرز التعليقات</span><div><button type="button" className={sortOrder === "newest" ? "active" : ""} onClick={() => setSortOrder("newest")} aria-pressed={sortOrder === "newest"}>الأحدث</button><button type="button" className={sortOrder === "engagement" ? "active" : ""} onClick={() => setSortOrder("engagement")} aria-pressed={sortOrder === "engagement"}>الأكثر تفاعلًا</button></div></div>}
      {comments.isLoading && <p className="comment-empty">جارٍ تحميل التعليقات المنشورة…</p>}
      {!comments.isLoading && !comments.data?.length && <p className="comment-empty"><MessageCircle size={19} /> لا توجد تعليقات بعد.</p>}
      {sortedComments.map(comment => <article id={`comment-${comment.id}`} className="comment-card" key={comment.id}><div className="comment-avatar">{comment.avatarUrl ? <img src={comment.avatarUrl} alt={`صورة رمزية لـ ${comment.displayName}`} loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(comment.avatarKind as AvatarKind) ? comment.avatarKind as AvatarKind : "wave"} />}</div><div className="comment-copy"><strong>{comment.displayName}</strong><time className="comment-date" dateTime={contributionDateTime(comment.createdAt)}>{formatContributionDate(comment.createdAt)}</time>{showLinkedRating && comment.rating && <span className="comment-rating" aria-label={`تقييم ${comment.rating} من 5`}><Star size={14} fill="currentColor" /> {comment.rating}/5</span>}<p>{comment.body}</p><div className="comment-reactions"><button type="button" className={`${comment.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(comment.id) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "heart")} aria-pressed={comment.viewerReaction === "heart"} aria-label="أعجبني التعليق"><Heart size={17} fill="currentColor" /> <span>{comment.hearts}</span></button><button type="button" className={`${comment.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(comment.id) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "broken")} aria-pressed={comment.viewerReaction === "broken"} aria-label="لم يعجبني التعليق"><HeartCrack size={17} /> <span>{comment.broken}</span></button><button type="button" className="comment-reply-action" disabled={!visitorId} onClick={() => openReply(comment.id, null, comment.displayName)}><MessageCircle size={15} /> رد</button><button type="button" className="comment-report-action" disabled={!visitorId} onClick={() => { setReportDetails(""); setReportTarget({ type: "comment", id: comment.id }); }}><Flag size={15} /> إبلاغ</button></div>{replyComposer(comment.id, null)}{replyThread(comment)}</div></article>)}
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="comment-profile-dialog" dir="rtl"><DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{profileDescription}</DialogDescription></DialogHeader>{profileMode === "rating-settings" ? <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي للعامة.</label> : <div className="comment-profile-fields"><label>اسم العرض<input value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={DISPLAY_NAME_MAX_LENGTH} placeholder="اسمك" required /></label><small className="field-character-count" aria-hidden="true">{displayName.length}/{DISPLAY_NAME_MAX_LENGTH}</small><div className="profile-avatar-picker"><span>صورة الملف الشخصي <small>اختيارية</small></span><div className="profile-avatar-preview">{avatarPreview ? <img src={avatarPreview} alt="معاينة صورة الملف الشخصي" /> : <AvatarArt kind={avatarKind} />}</div><div className="ready-avatar-options"><span>اختر صورة جاهزة</span><div>{readyAvatarOptions.map(avatar => <button type="button" key={avatar.url} className={avatarPreview === avatar.url ? "active" : ""} onClick={() => setAvatarPreview(avatar.url)} aria-label={avatar.label}><img src={avatar.url} alt="" /></button>)}</div></div></div>{profileMode === "comment" && showLinkedRating && feedback.data?.ownRating && <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي بجانب تعليقي.</label>}</div>}<DialogFooter><button type="button" className="button ghost" onClick={() => setProfileOpen(false)}>إلغاء</button><button type="button" className="button" disabled={profileActionDisabled} onClick={publishWithProfile}>{profileActionLabel}</button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(commentPendingDeletion)} onOpenChange={open => { if (!open && !remove.isPending) setCommentPendingDeletion(undefined); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف تعليقك؟</AlertDialogTitle><AlertDialogDescription>سيُحذف تعليقك من الصفحة، وستتمكن من كتابة تعليق جديد بعد الحذف.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-700 text-white hover:bg-red-800" disabled={remove.isPending || !visitorId} onClick={event => { event.preventDefault(); if (commentPendingDeletion && visitorId) remove.mutate({ commentId: commentPendingDeletion, visitorId }); }}>{remove.isPending ? "جارٍ الحذف…" : "حذف التعليق"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={Boolean(replyPendingDeletion)} onOpenChange={open => { if (!open && !removeReply.isPending) setReplyPendingDeletion(undefined); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف ردك؟</AlertDialogTitle><AlertDialogDescription>سيُحذف ردك من الصفحة بعد التأكيد، ويمكنك التراجع من الإشعار لمدة خمس ثوانٍ.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-700 text-white hover:bg-red-800" disabled={removeReply.isPending || !visitorId} onClick={event => { event.preventDefault(); if (replyPendingDeletion && visitorId) removeReply.mutate({ replyId: replyPendingDeletion, visitorId }); }}>{removeReply.isPending ? "جارٍ الحذف…" : "حذف الرد"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={Boolean(reportTarget)} onOpenChange={open => { if (!open && !report.isPending) setReportTarget(undefined); }}><DialogContent className="comment-report-dialog" dir="rtl"><DialogHeader><DialogTitle>الإبلاغ عن محتوى</DialogTitle><DialogDescription>اكتب سبب الإبلاغ بإيجاز. يراجع النظام النص والاسم وصورة الملف الشخصي عند وجودها، ولا يُحذف المحتوى أو يُقيّد صاحبه إلا عند تأكيد مخالفة فعلية.</DialogDescription></DialogHeader><div className="comment-report-fields"><label>سبب الإبلاغ<textarea value={reportDetails} onChange={event => setReportDetails(event.target.value)} minLength={4} maxLength={REPORT_DETAILS_MAX_LENGTH} placeholder="مثال: إساءة، محتوى غير لائق، أو صورة ملف غير مناسبة…" required autoFocus /></label><small className="field-character-count" aria-hidden="true">{reportDetails.length}/{REPORT_DETAILS_MAX_LENGTH}</small></div><DialogFooter><button type="button" className="button ghost" disabled={report.isPending} onClick={() => setReportTarget(undefined)}>إلغاء</button><button type="button" className="button" disabled={!visitorId || !reportTarget || report.isPending || reportDetails.trim().length < 4 || reportDetails.trim().length > REPORT_DETAILS_MAX_LENGTH} onClick={() => visitorId && reportTarget && report.mutate({ reporterVisitorId: visitorId, targetType: reportTarget.type, targetId: reportTarget.id, reason: inferReportReason(reportDetails), details: reportDetails.trim() })}>{report.isPending ? "جارٍ الإرسال…" : "إرسال البلاغ"}</button></DialogFooter></DialogContent></Dialog>
  </section>;
}
