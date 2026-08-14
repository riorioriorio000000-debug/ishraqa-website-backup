export type CommentSubmission = {
  pageKey: string;
  displayName: string;
  body: string;
  avatarKind: string;
};

export const directCommentStatus = "published" as const;

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
