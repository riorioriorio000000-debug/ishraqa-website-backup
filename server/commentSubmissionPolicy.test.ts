import { describe, expect, it } from "vitest";
import { directCommentStatus, isDuplicateComment, normalizeCommentSubmission } from "./commentSubmissionPolicy";

describe("سياسة نشر التعليقات", () => {
  const input = { pageKey: " home-cleaning-guide ", displayName: " أحمد ", body: " تجربة مفيدة جدًا ", avatarKind: "wave" };

  it("ينشر التعليق مباشرة بعد تطبيع الحقول", () => {
    expect(normalizeCommentSubmission(input)).toEqual({ pageKey: "home-cleaning-guide", displayName: "أحمد", body: "تجربة مفيدة جدًا", avatarKind: "wave" });
    expect(directCommentStatus).toBe("published");
  });

  it("يمنع تكرار التعليق نفسه في المقال نفسه مع السماح بتعليق مختلف", () => {
    const existing = { pageKey: "home-cleaning-guide", displayName: "أحمد", body: "تجربة مفيدة جدًا" };
    expect(isDuplicateComment(existing, input)).toBe(true);
    expect(isDuplicateComment(existing, { ...input, body: "سؤال مختلف عن الخدمة" })).toBe(false);
  });
});
