export type CommentSubmission = {
  pageKey: string;
  displayName: string;
  body: string;
  avatarKind: string;
};

export const directCommentStatus = "published" as const;

const blockedCommentPatterns = [
  /(?:سأ|سوف)?\s*أ?قتلك/i,
  /(?:^|\s)(?:تب[ًا]+|غبي|حمار|كلب|أ?كرهك)(?=\s|$|[.!؟،])/i,
  /(.)\1{14,}/,
];

export function normalizeCommentSubmission(input: CommentSubmission): CommentSubmission {
  return {
    ...input,
    pageKey: input.pageKey.trim(),
    displayName: input.displayName.trim(),
    body: input.body.trim(),
  };
}

export function isDuplicateComment(existing: Pick<CommentSubmission, "pageKey" | "displayName" | "body"> | undefined, input: CommentSubmission) {
  if (!existing) return false;
  const normalized = normalizeCommentSubmission(input);
  return existing.pageKey === normalized.pageKey && existing.displayName === normalized.displayName && existing.body === normalized.body;
}

/** A conservative abuse filter. It never manufactures moderation decisions; uncertain messages remain publishable. */
export function passesAutomaticCommentScreening(input: Pick<CommentSubmission, "displayName" | "body">) {
  const text = `${input.displayName}\n${input.body}`.trim();
  return text.length > 0 && !blockedCommentPatterns.some((pattern) => pattern.test(text));
}
