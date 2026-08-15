import { Camera, Heart, HeartCrack, MessageCircle, Pencil, Send, Star, Trash2, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { nextReaction } from "@shared/interactionHelpers";

const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const avatarKinds = ["wave", "spark", "leaf", "star"] as const;
const readyAvatarOptions = [
  { kind: "wave", label: "رسم موجة تركوازية" },
  { kind: "spark", label: "رسم شرارة ذهبية" },
  { kind: "leaf", label: "رسم ورقة هادئة" },
  { kind: "star", label: "رسم نجمة بسيطة" },
] as const;
type AvatarMimeType = typeof AVATAR_MIME_TYPES[number];
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
  const shapes: Record<AvatarKind, JSX.Element> = {
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
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>();
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [avatarName, setAvatarName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMode, setProfileMode] = useState<ProfileMode>("comment");
  const [ratingPrivate, setRatingPrivate] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number>();
  const [commentPendingDeletion, setCommentPendingDeletion] = useState<number>();
  const [reactingTo, setReactingTo] = useState<number[]>([]);
  const [status, setStatus] = useState<string>();

  const comments = trpc.interactions.listComments.useQuery({ pageKey, visitorId });
  const feedback = trpc.interactions.articleFeedback.useQuery({ pageKey, visitorId });
  const uploadAvatar = trpc.interactions.uploadAvatar.useMutation();
  const updateFeedback = trpc.interactions.submitArticleFeedback.useMutation({ onSuccess: () => { void feedback.refetch(); void comments.refetch(); } });
  const submit = trpc.interactions.submitComment.useMutation({ onSuccess: result => {
    if (result.accepted) { clearEditor(); setProfileOpen(false); setStatus("نُشر تعليقك الآن بعد فحص آلي سريع للمحتوى."); void comments.refetch(); void feedback.refetch(); }
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
  const react = trpc.interactions.react.useMutation({ onSuccess: () => void comments.refetch(), onSettled: (_value, _error, variables) => setReactingTo(current => current.filter(id => id !== variables.commentId)) });

  useEffect(() => setVisitorId(getVisitorId()), []);
  useEffect(() => { if (feedback.data) setRatingPrivate(!feedback.data.ownIsPublic); }, [feedback.data]);
  const ownComment = comments.data?.find(comment => comment.isOwner);
  const isWorking = submit.isPending || update.isPending || uploadAvatar.isPending || updateFeedback.isPending;

  function clearEditor() { setBody(""); setAvatarDataUrl(undefined); setAvatarPreview(undefined); setAvatarName(""); setEditingCommentId(undefined); }
  function openRatingSettings() { if (!feedback.data?.ownRating) return; setProfileMode("rating-settings"); setStatus(undefined); setProfileOpen(true); }
  function openProfile(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!visitorId || ownComment || body.trim().length < 4) return; setStatus(undefined); setEditingCommentId(undefined); setProfileMode("comment"); setProfileOpen(true); }
  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!AVATAR_MIME_TYPES.includes(file.type as AvatarMimeType) || file.size > 2_000_000) { setStatus("اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 2 ميغابايت."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { const value = typeof reader.result === "string" ? reader.result : ""; setAvatarDataUrl(value); setAvatarPreview(value); setAvatarName(file.name); };
    reader.readAsDataURL(file);
  }
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
      const mimeType = avatarDataUrl?.match(/^data:([^;]+);base64,/)?.[1] as AvatarMimeType | undefined;
      const uploaded = avatarDataUrl && mimeType ? await uploadAvatar.mutateAsync({ visitorId, name: avatarName || "avatar", mimeType, dataUrl: avatarDataUrl }) : undefined;
      if (showLinkedRating && feedback.data?.ownRating) await updateFeedback.mutateAsync({ pageKey, visitorId, rating: feedback.data.ownRating, isPublic: !ratingPrivate });
      const payload = { pageKey, visitorId, displayName: displayName.trim(), body: body.trim(), avatarKind, avatarUrl: uploaded?.url };
      if (editingCommentId) update.mutate({ ...payload, commentId: editingCommentId }); else submit.mutate(payload);
    } catch { setStatus("تعذر حفظ إعدادات الملف الشخصي الآن. يمكنك المحاولة لاحقًا."); }
  }
  function startEdit() {
    if (!ownComment) return;
    setEditingCommentId(ownComment.id);
    setDisplayName(ownComment.displayName);
    setBody(ownComment.body);
    setAvatarPreview(ownComment.avatarUrl || undefined);
    setAvatarDataUrl(undefined);
    setAvatarKind(avatarKinds.includes(ownComment.avatarKind as AvatarKind) ? ownComment.avatarKind as AvatarKind : "wave");
    setProfileMode("comment");
    setProfileOpen(true);
  }
  function toggleReaction(commentId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") {
    if (!visitorId || reactingTo.includes(commentId)) return;
    setReactingTo(items => [...items, commentId]);
    window.setTimeout(() => react.mutate({ commentId, visitorId, reaction: nextReaction(current, requested) }), 80);
  }

  const dialogTitle = profileMode === "rating-settings" ? "إعدادات تقييمك" : editingCommentId ? "تعديل تعليقك" : "قبل نشر تعليقك";
  return <section className="article-comments" aria-labelledby="comments-heading">
    <div className="article-comments-head"><h2 id="comments-heading">أضف تعليقًا</h2><p>شارك سؤالك أو ملاحظتك المرتبطة بالصفحة. التعليق مستقل عن تقييم النجوم.</p>{showLinkedRating && feedback.data?.ownRating && <button type="button" className="comment-owner-action rating-settings-action" onClick={openRatingSettings}><Pencil size={15} /> إعداد ظهور تقييمي</button>}</div>
    {ownComment ? <div className="comment-owner-panel"><p>لديك تعليق واحد منشور في هذه الصفحة. يمكنك تعديله أو حذفه قبل إضافة تعليق جديد.</p><div><button type="button" className="comment-owner-action" onClick={startEdit}><Pencil size={15} /> تعديل تعليقي</button><button type="button" className="comment-owner-action danger" disabled={remove.isPending || !visitorId} onClick={() => setCommentPendingDeletion(ownComment.id)}><Trash2 size={15} /> حذف تعليقي</button></div></div> : <form className="comment-form" onSubmit={openProfile}><label>تعليقك<textarea value={body} onChange={event => setBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب سؤالًا أو تجربة مرتبطة بالصفحة…" required /></label><button className="button" type="submit" disabled={!visitorId || isWorking}><Send size={16} /> أضف تعليقًا</button></form>}
    {status && <p className="comment-status" role="status">{status}</p>}
    <div className="comment-list" aria-live="polite">
      {comments.isLoading && <p className="comment-empty">جارٍ تحميل التعليقات المنشورة…</p>}
      {!comments.isLoading && !comments.data?.length && <p className="comment-empty"><MessageCircle size={19} /> لا توجد تعليقات بعد. كن أول من يضيف رأيًا حقيقيًا.</p>}
      {comments.data?.map(comment => <article className="comment-card" key={comment.id}><div className="comment-avatar" aria-hidden="true">{comment.avatarUrl ? <img src={comment.avatarUrl} alt="" loading="lazy" /> : <AvatarArt kind={avatarKinds.includes(comment.avatarKind as AvatarKind) ? comment.avatarKind as AvatarKind : "wave"} />}</div><div className="comment-copy"><strong>{comment.displayName}</strong>{showLinkedRating && comment.rating && <span className="comment-rating" aria-label={`تقييم ${comment.rating} من 5`}><Star size={14} fill="currentColor" /> {comment.rating}/5</span>}<p>{comment.body}</p><div className="comment-reactions"><button type="button" className={`${comment.viewerReaction === "heart" ? "active " : ""}heart ${reactingTo.includes(comment.id) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "heart")} aria-pressed={comment.viewerReaction === "heart"} aria-label="أعجبني التعليق"><Heart size={17} fill="currentColor" /> <span>{comment.hearts}</span></button><button type="button" className={`${comment.viewerReaction === "broken" ? "active " : ""}broken ${reactingTo.includes(comment.id) ? "is-reacting" : ""}`} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "broken")} aria-pressed={comment.viewerReaction === "broken"} aria-label="لم يعجبني التعليق"><HeartCrack size={17} /> <span>{comment.broken}</span></button></div></div></article>)}
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="comment-profile-dialog" dir="rtl"><DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{profileMode === "rating-settings" ? "غيّر ظهور تقييمك متى أردت. يبقى التقييم محفوظًا حتى عندما تختار إخفاءه." : "اختر اسم العرض وصورة شخصية اختيارية، ثم انشر تعليقك."}</DialogDescription></DialogHeader>{profileMode === "rating-settings" ? <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي للعامة.</label> : <div className="comment-profile-fields"><label>اسم العرض<input value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={64} placeholder="مثال: أحمد من الرياض" required /></label><div className="profile-avatar-picker"><span>صورة الملف الشخصي <small>اختيارية</small></span><div className="profile-avatar-preview">{avatarPreview ? <img src={avatarPreview} alt="معاينة صورة الملف الشخصي" /> : <AvatarArt kind={avatarKind} />}</div><div className="ready-avatar-options"><span>رسومات جاهزة</span><div>{readyAvatarOptions.map(avatar => <button type="button" key={avatar.kind} className={avatarKind === avatar.kind && !avatarPreview ? "active" : ""} onClick={() => { setAvatarDataUrl(undefined); setAvatarName(""); setAvatarPreview(undefined); setAvatarKind(avatar.kind); }} aria-label={avatar.label}><AvatarArt kind={avatar.kind} /></button>)}</div></div><label className="profile-upload-button"><Camera size={15} /> اختيار صورة<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onAvatarChange} /></label>{avatarPreview && <button type="button" className="profile-remove-button" onClick={() => { setAvatarDataUrl(undefined); setAvatarPreview(undefined); setAvatarName(""); }}><X size={15} /> إزالة الصورة</button>}</div>{showLinkedRating && feedback.data?.ownRating && <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي بجانب تعليقي.</label>}</div>}<DialogFooter><button type="button" className="button ghost" onClick={() => setProfileOpen(false)}>إلغاء</button><button type="button" className="button" disabled={isWorking || (profileMode === "comment" && (displayName.trim().length < 2 || body.trim().length < 4))} onClick={publishWithProfile}>{isWorking ? "جارٍ الحفظ…" : profileMode === "rating-settings" ? "حفظ إعدادات التقييم" : editingCommentId ? "حفظ التعديل" : "نشر التعليق"}</button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(commentPendingDeletion)} onOpenChange={open => { if (!open && !remove.isPending) setCommentPendingDeletion(undefined); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف تعليقك؟</AlertDialogTitle><AlertDialogDescription>سيُحذف تعليقك من الصفحة، وستتمكن من كتابة تعليق جديد بعد الحذف.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-700 text-white hover:bg-red-800" disabled={remove.isPending || !visitorId} onClick={event => { event.preventDefault(); if (commentPendingDeletion && visitorId) remove.mutate({ commentId: commentPendingDeletion, visitorId }); }}>{remove.isPending ? "جارٍ الحذف…" : "حذف التعليق"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
