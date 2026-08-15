import { describe, expect, it } from "vitest";
import { directCommentStatus, isDuplicateComment, normalizeCommentSubmission, passesAutomaticCommentScreening, replyCooldownRemainingSeconds } from "./commentSubmissionPolicy";

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

  it("ينشر التعليق السليم ويمنع الإساءة أو التكرار الحرفي المبالغ فيه", () => {
    expect(passesAutomaticCommentScreening({ displayName: "سارة", body: "المقال مرتب وواضح، شكرًا لكم." })).toBe(true);
    expect(passesAutomaticCommentScreening({ displayName: "سارة", body: "أنت غبي" })).toBe(false);
    expect(passesAutomaticCommentScreening({ displayName: "سارة", body: "اااااااااااااااااا" })).toBe(false);
  });

  it("يسمح برد واحد على الرسالة نفسها خلال ساعة ثم يفتح الرد التالي بعد انقضائها", () => {
    const sentAt = new Date("2026-08-15T12:00:00.000Z");
    expect(replyCooldownRemainingSeconds(sentAt, Date.parse("2026-08-15T12:30:00.000Z"))).toBe(1800);
    expect(replyCooldownRemainingSeconds(sentAt, Date.parse("2026-08-15T13:00:00.000Z"))).toBe(0);
    expect(replyCooldownRemainingSeconds(undefined, Date.parse("2026-08-15T12:00:00.000Z"))).toBe(0);
  });
});
