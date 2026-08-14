import { Heart, HeartCrack, MessageCircle, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { nextReaction } from "@shared/interactionHelpers";

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
  const [submitted, setSubmitted] = useState(false);
  const comments = trpc.interactions.listComments.useQuery({ pageKey, visitorId });
  const submit = trpc.interactions.submitComment.useMutation({ onSuccess: () => { setBody(""); setSubmitted(true); } });
  const react = trpc.interactions.react.useMutation({ onSuccess: () => comments.refetch() });

  useEffect(() => { setVisitorId(getVisitorId()); }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit.mutate({ pageKey, displayName, body, avatarKind: "wave" });
  };
  const toggleReaction = (commentId: number, current: "heart" | "broken" | null, requested: "heart" | "broken") => {
    if (!visitorId || react.isPending) return;
    react.mutate({ commentId, visitorId, reaction: nextReaction(current, requested) });
  };

  return <section className="article-comments" aria-labelledby="comments-heading">
    <div className="article-comments-head"><span className="eyebrow"><i /> نقاش القرّاء</span><h2 id="comments-heading">شارك انطباعك عن المقال</h2><p>تظهر التعليقات بعد مراجعة الإدارة. لا نضيف تعليقات أو تفاعلات من عندنا.</p></div>
    <form className="comment-form" onSubmit={onSubmit}>
      <label>اسم العرض<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={64} placeholder="مثال: أحمد من الرياض" required /></label>
      <label>تعليقك<textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={4} maxLength={800} placeholder="اكتب سؤالًا أو تجربة مرتبطة بالمقال..." required /></label>
      <button className="button" type="submit" disabled={submit.isPending}><Send size={16} /> {submit.isPending ? "جارٍ الإرسال…" : "إرسال للمراجعة"}</button>
      {submitted && <p className="comment-status" role="status">شكرًا لك. سيظهر تعليقك بعد مراجعته.</p>}
      {submit.isError && <p className="comment-status error" role="status">تعذّر الإرسال الآن. حاول مرة أخرى.</p>}
    </form>
    <div className="comment-list" aria-live="polite">
      {comments.isLoading && <p className="comment-empty">جارٍ تحميل التعليقات المنشورة…</p>}
      {!comments.isLoading && !comments.data?.length && <p className="comment-empty"><MessageCircle size={19} /> لا توجد تعليقات منشورة بعد. كن أول من يضيف رأيًا للمراجعة.</p>}
      {comments.data?.map((comment) => <article className="comment-card" key={comment.id}>
        <div className="comment-avatar" aria-hidden="true">⌁</div>
        <div className="comment-copy"><strong>{comment.displayName}</strong><p>{comment.body}</p><div className="comment-reactions">
          <button type="button" className={comment.viewerReaction === "heart" ? "active heart" : "heart"} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "heart")} aria-pressed={comment.viewerReaction === "heart"} aria-label="أعجبني التعليق"><Heart size={17} fill="currentColor" /> <span>{comment.hearts}</span></button>
          <button type="button" className={comment.viewerReaction === "broken" ? "active broken" : "broken"} onClick={() => toggleReaction(comment.id, comment.viewerReaction, "broken")} aria-pressed={comment.viewerReaction === "broken"} aria-label="لم يعجبني التعليق"><HeartCrack size={17} /> <span>{comment.broken}</span></button>
        </div></div>
      </article>)}
    </div>
  </section>;
}
