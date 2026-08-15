import { Camera, Heart, HeartCrack, MessageCircle, Pencil, Send, Star, Trash2, UserRound, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { nextReaction } from "@shared/interactionHelpers";

const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const avatarKinds = ["wave", "spark", "leaf", "star"] as const;
const readyAvatars = [
  { label: "صورة رمزية جاهزة 1", url: "/manus-storage/avatar-ready-1_855159e4.jpg" },
  { label: "صورة رمزية جاهزة 2", url: "/manus-storage/avatar-ready-2_0dc2368f.jpg" },
  { label: "صورة رمزية جاهزة 3", url: "/manus-storage/avatar-ready-3_44ae3069.jpg" },
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

export default function ArticleComments({ pageKey }: { pageKey: string }) {
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
  const [status, setStatus] = useState<string>();

  const comments = trpc.interactions.listComments.useQuery({ pageKey, visitorId });
  const feedback = trpc.interactions.articleFeedback.useQuery({ pageKey, visitorId });
  const uploadAvatar = trpc.interactions.uploadAvatar.useMutation();
  const updateFeedback = trpc.interactions.submitArticleFeedback.useMutation({ onSuccess: () => { feedback.refetch(); comments.refetch(); } });
  const submit = trpc.interactions.submitComment.useMutation({ onSuccess: result => {
    if (result.accepted) { clearEditor(); setProfileOpen(false); setStatus("نُشر تعليقك الآن بعد فحص آلي سريع للمحتوى."); comments.refetch(); feedback.refetch(); }
    else setStatus(result.reason === "active-comment-exists" ? "لديك تعليق منشور بالفعل. احذفه أولًا قبل إضافة تعليق جديد." : "تعذر نشر التعليق لأن الصياغة تحتاج تعديلًا بسيطًا.");
  } });
  const update = trpc.interactions.updateComment.useMutation({ onSuccess: result => {
    if (result.updated) { clearEditor(); setProfileOpen(false); setStatus("تم تحديث تعليقك ونشر التعديل الآن."); comments.refetch(); feedback.refetch(); }
    else setStatus(result.reason === "content-not-allowed" ? "تعذر تحديث التعليق لأن الصياغة تحتاج تعديلًا بسيطًا." : "تعذر العثور على تعليقك لتحديثه.");
  } });
  const remove = trpc.interactions.deleteComment.useMutation({ onSuccess: result => { setStatus(result.deleted ? "حُذف تعليقك. يمكنك إضافة تعليق جديد متى أردت." : "تعذر حذف التعليق لأنه لم يعد متاحًا ضمن ملكيتك."); comments.refetch(); } });
  const react = trpc.interactions.react.useMutation({ onSuccess: () => comments.refetch() });

  useEffect(() => { setVisitorId(getVisitorId()); }, []);
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
      setProfileOpen(false); setStatus(ratingPrivate ? "سيبقى تقييمك محفوظًا لكنه مخفي عن الزوار." : "أصبح تقييمك ظاهرًا للزوار ويمكن عرضه بجانب تعليقك.");
      return;
    }
    if (displayName.trim().length < 2 || body.trim().length < 4) return;
    setStatus(undefined);
    try {
      const mimeType = avatarDataUrl?.match(/^data:([^;]+);base64,/)?.[1] as AvatarMimeType | undefined;
      const uploaded = avatarDataUrl && mimeType ? await uploadAvatar.mutateAsync({ visitorId, name: avatarName || "avatar", mimeType, dataUrl: avatarDataUrl }) : undefined;
      if (feedback.data?.ownRating) await updateFeedback.mutateAsync({ pageKey, visitorId, rating: feedback.data.ownRating, isPublic: !ratingPrivate });
      const payload = { pageKey, visitorId, displayName: displayName.trim(), body: body.trim(), avatarKind, avatarUrl: uploaded?.url || (avatarPreview?.startsWith("/manus-storage/") ? avatarPreview : undefined) };
      if (editingCommentId) update.mutate({ ...payload, commentId: editingCommentId }); else submit.mutate(payload);
    } catch { setStatus("تعذر حفظ إعدادات الملف الشخصي الآن. يمكنك المحاولة لاحقًا."); }
  }
  function startEdit() { if (!ownComment) return; setEditingCommentId(ownComment.id); setDisplayName(ownComment.displayName); setBody(ownComment.body); setAvatarPreview(ownComment.avatarUrl || undefined); setAvatarDataUrl(undefined); setAvatarKind(avatarKinds.includes(ownComment.avatarKind as AvatarKind) ? ownComment.avatarKind as AvatarKind : "wave"); setProfileMode("comment"); setProfileOpen(true); }
  function toggleReaction(commentId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") { if (!visitorId || react.isPending) return; react.mutate({ commentId, visitorId, reaction: nextReaction(current, requested) }); }

  const dialogTitle = profileMode === "rating-settings" ? "إعدادات تقييمك" : editingCommentId ? "تعديل تعليقك" : "قبل نشر تعليقك";
  return <section className="article-comments" aria-labelledby="comments-heading">
    <div className="article-comments-head"><span className="eyebrow"><i /> بعد التقييم</span><h2 id="comments-heading">أضف تعليقك إن رغبت</h2><p>يمكنك التقييم فقط، أو إضافة تعليق لاحقًا ليظهر بجانب تقييمك عند اختيار إظهاره للعامة.</p>{feedback.data?.ownRating && <button type="button" className="comment-owner-action rating-settings-action" onClick={openRatingSettings}><Pencil size={15} /> {feedback.data.ownIsPublic ? "إدارة ظهور تقييمي" : "تقييمي مخفي — عدّل الظهور"}</button>}</div>
    {ownComment ? <div className="comment-owner-panel"><p>لديك تعليق واحد منشور في هذا المقال. يمكنك تعديله أو حذفه قبل إضافة تعليق جديد.</p><div><button type="button" className="comment-owner-action" onClick={startEdit}><Pencil size={15} /> تعديل تعليقي</button><button type="button" className="comment-owner-action danger" disabled={remove.isPending || !visitorId} onClick={() => visitorId && remove.mutate({ commentId: ownComment.id, visitorId })}><Trash2 size={15} /> {remove.isPending ? "جارٍ الحذف…" : "حذف تعليقي"}</button></div></div> : <form className="comment-form" onSubmit={openProfile}><label>تعليقك<textarea value={body} onChange={event => setBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب سؤالًا أو تجربة مرتبطة بالمقال…" required /></label><button className="button" type="submit" disabled={!visitorId || isWorking}><Send size={16} /> أضف تعليقًا</button></form>}
    {status && <p className="comment-status" role="status">{status}</p>}
    <div className="comment-list" aria-live="polite">
      {comments.isLoading && <p className="comment-empty">جارٍ تحميل التعليقات المنشورة…</p>}
      {!comments.isLoading && !comments.data?.length && <p className="comment-empty"><MessageCircle size={19} /> لا توجد تعليقات بعد. كن أول من يضيف رأيًا حقيقيًا.</p>}
      {comments.data?.map(comment => <article className="comment-card" key={comment.id}><div className="comment-avatar" aria-hidden="true">{comment.avatarUrl ? <img src={comment.avatarUrl} alt="" loading="lazy" /> : <UserRound size={18} />}</div><div className="comment-copy"><strong>{comment.displayName}</strong>{comment.rating && <span className="comment-rating" aria-label={`تقييم ${comment.rating} من 5`}><Star size={14} fill="currentColor" /> {comment.rating}/5</span>}<p>{comment.body}</p><div className="comment-reactions"><button type="button" className={comment.viewerReaction === "heart" ? "active heart" : "heart"} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "heart")} aria-pressed={comment.viewerReaction === "heart"} aria-label="أعجبني التعليق"><Heart size={17} fill="currentColor" /> <span>{comment.hearts}</span></button><button type="button" className={comment.viewerReaction === "broken" ? "active broken" : "broken"} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "broken")} aria-pressed={comment.viewerReaction === "broken"} aria-label="لم يعجبني التعليق"><HeartCrack size={17} /> <span>{comment.broken}</span></button></div></div></article>)}
    </div>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent className="comment-profile-dialog" dir="rtl"><DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>{profileMode === "rating-settings" ? "غيّر ظهور تقييمك متى أردت. يبقى التقييم محفوظًا حتى عندما تختار إخفاءه." : "اختر اسم العرض، وأضف صورة اختيارية. يمكنك أيضًا تحديد ما إذا كان تقييمك يظهر بجانب تعليقك."}</DialogDescription></DialogHeader>{profileMode === "rating-settings" ? <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي للعامة.</label> : <div className="comment-profile-fields"><label>اسم العرض<input value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={64} placeholder="مثال: أحمد من الرياض" required /></label><div className="profile-avatar-picker"><span>صورة الملف الشخصي <small>اختيارية</small></span><div className="profile-avatar-preview">{avatarPreview ? <img src={avatarPreview} alt="معاينة صورة الملف الشخصي" /> : <UserRound size={24} />}</div><div className="ready-avatar-options"><span>اختيارات جاهزة</span><div>{readyAvatars.map(avatar => <button type="button" key={avatar.url} className={avatarPreview === avatar.url ? "active" : ""} onClick={() => { setAvatarDataUrl(undefined); setAvatarName(""); setAvatarPreview(avatar.url); }} aria-label={avatar.label}><img src={avatar.url} alt="" /></button>)}</div></div><label className="profile-upload-button"><Camera size={15} /> اختيار صورة<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onAvatarChange} /></label>{avatarPreview && <button type="button" className="profile-remove-button" onClick={() => { setAvatarDataUrl(undefined); setAvatarPreview(undefined); setAvatarName(""); }}><X size={15} /> إزالة الصورة</button>}</div>{feedback.data?.ownRating && <label className="article-rating-visibility dialog-rating-visibility"><input type="checkbox" checked={!ratingPrivate} onChange={event => setRatingPrivate(!event.target.checked)} /> إظهار تقييمي بجانب تعليقي.</label>}<div className="avatar-kind-picker"><span>رمز بديل بسيط</span>{avatarKinds.map(kind => <button key={kind} type="button" className={avatarKind === kind ? "active" : ""} onClick={() => setAvatarKind(kind)} aria-label={`رمز ${kind}`}>{kind === "wave" ? "⌁" : kind === "spark" ? "✦" : kind === "leaf" ? "❋" : "✶"}</button>)}</div></div>}<DialogFooter><button type="button" className="button ghost" onClick={() => setProfileOpen(false)}>إلغاء</button><button type="button" className="button" disabled={isWorking || (profileMode === "comment" && (displayName.trim().length < 2 || body.trim().length < 4))} onClick={publishWithProfile}>{isWorking ? "جارٍ الحفظ…" : profileMode === "rating-settings" ? "حفظ إعدادات التقييم" : editingCommentId ? "حفظ التعديل" : "نشر التعليق"}</button></DialogFooter></DialogContent></Dialog>
  </section>;
}
