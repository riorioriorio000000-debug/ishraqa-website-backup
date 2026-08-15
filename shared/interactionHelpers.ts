export type CommentReaction = "heart" | "broken";

export function makeReactionId(commentId: number, visitorId: string) {
  return `${commentId}:${visitorId}`;
}

export function nextReaction(current: CommentReaction | null, requested: CommentReaction): CommentReaction | null {
  return current === requested ? null : requested;
}
