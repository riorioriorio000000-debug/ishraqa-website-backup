// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArticleComments from "./ArticleComments";

const { reactMutate, submitMutate, submitReplyMutate, undoMutate, reportMutate, setCommentsData, toastSuccess } = vi.hoisted(() => ({
  reactMutate: vi.fn(),
  submitMutate: vi.fn(),
  submitReplyMutate: vi.fn(),
  undoMutate: vi.fn(),
  reportMutate: vi.fn(),
  setCommentsData: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ interactions: { listComments: { setData: setCommentsData } } }),
    interactions: {
      listComments: { useQuery: () => ({
        data: [{ id: 24, displayName: "زائر", body: "تعليق صالح للاختبار", avatarKind: "wave", avatarUrl: null, rating: null, hearts: 2, broken: 0, viewerReaction: null, isOwner: false, createdAt: "2026-08-16T13:42:00.000Z" }],
        isLoading: false,
        refetch: vi.fn(),
      }) },
      articleFeedback: { useQuery: () => ({ data: { ownRating: null, ownIsPublic: false }, refetch: vi.fn() }) },
      uploadAvatar: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
      submitArticleFeedback: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
      submitComment: { useMutation: (options: { onSuccess?: (value: { accepted: boolean; commentId?: number }) => void }) => ({
        mutate: (input: unknown) => { submitMutate(input); options.onSuccess?.({ accepted: true, commentId: 61 }); },
        isPending: false,
      }) },
      updateComment: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      deleteComment: { useMutation: () => ({
        mutate: (input: unknown) => undoMutate(input),
        isPending: false,
      }) },
      react: { useMutation: () => ({ mutate: reactMutate, isPending: false }) },
      reportContent: { useMutation: () => ({ mutate: reportMutate, isPending: false }) },
      submitReply: { useMutation: () => ({ mutate: submitReplyMutate, isPending: false }) },
      reactToReply: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess } }));

afterEach(() => {
  cleanup();
  reactMutate.mockClear();
  submitMutate.mockClear();
  submitReplyMutate.mockClear();
  undoMutate.mockClear();
  reportMutate.mockClear();
  setCommentsData.mockClear();
  toastSuccess.mockClear();
  localStorage.clear();
});

describe("ArticleComments", () => {
  it("يعرض وقت النشر الدقيق للتعليق في عنصر وقت قابل للقراءة", async () => {
    const { container } = render(<ArticleComments pageKey="article-test" />);

    const publishedAt = container.querySelector("time");
    expect(publishedAt?.tagName).toBe("TIME");
    expect(publishedAt?.getAttribute("dateTime")).toBe("2026-08-16T13:42:00.000Z");
    expect(publishedAt?.textContent).not.toBe("—");
  });

  it("يبدأ تفاعل القلب فور النقر ثم يرسل المزامنة في الخلفية", async () => {
    const user = userEvent.setup();
    render(<ArticleComments pageKey="article-test" />);

    const heart = await screen.findByRole("button", { name: "أعجبني التعليق" });
    await user.click(heart);

    expect(heart.className).toContain("is-reacting");
    expect(setCommentsData).toHaveBeenCalled();
    expect(reactMutate).toHaveBeenCalledWith(expect.objectContaining({ commentId: 24, reaction: "heart" }));
  });

  it("يعرض إشعار نشر التعليق مع تراجع آمن", async () => {
    const user = userEvent.setup();
    render(<ArticleComments pageKey="article-test" />);

    await user.type(screen.getByRole("textbox", { name: "تعليقك" }), "هذا تعليق جديد للاختبار");
    await user.click(screen.getByRole("button", { name: /أضف تعليقًا/ }));
    await screen.findByRole("dialog");
    await user.type(screen.getByRole("textbox", { name: "اسم العرض" }), "زائر اختبار");
    await user.click(screen.getByRole("button", { name: "نشر التعليق" }));

    expect(submitMutate).toHaveBeenCalledWith(expect.objectContaining({ pageKey: "article-test", displayName: "زائر اختبار" }));
    expect(JSON.parse(localStorage.getItem("ishraqa-comment-profile") ?? "{}")).toMatchObject({ displayName: "زائر اختبار" });
    expect(toastSuccess).toHaveBeenCalledWith("تم نشر تعليقك.", expect.objectContaining({ action: expect.objectContaining({ label: "تراجع" }) }));
    const notificationOptions = toastSuccess.mock.calls[0][1] as { action: { onClick: () => void } };
    notificationOptions.action.onClick();
    expect(undoMutate).toHaveBeenCalledWith(expect.objectContaining({ commentId: 61 }));
  });

  it("يستعيد اسم الزائر وصورته المحفوظين عند فتح نموذج تعليق جديد", async () => {
    const user = userEvent.setup();
    localStorage.setItem("ishraqa-comment-profile", JSON.stringify({ displayName: "زائر محفوظ", avatarUrl: "/manus-storage/avatar-test.png" }));
    render(<ArticleComments pageKey="article-test" />);

    await user.type(screen.getByRole("textbox", { name: "تعليقك" }), "تعليق لاستعادة الملف المحفوظ");
    await user.click(screen.getByRole("button", { name: /أضف تعليقًا/ }));

    expect((await screen.findByRole("textbox", { name: "اسم العرض" }) as HTMLInputElement).value).toBe("زائر محفوظ");
    expect(screen.getByAltText("معاينة صورة الملف الشخصي").getAttribute("src")).toBe("/manus-storage/avatar-test.png");
  });

  it("يفتح الإبلاغ بحقل سبب مباشر ويصنفه قبل الإرسال", async () => {
    const user = userEvent.setup();
    render(<ArticleComments pageKey="article-test" />);

    await user.click(screen.getByRole("button", { name: "إبلاغ" }));
    expect(screen.queryByRole("combobox")).toBeNull();
    await user.type(screen.getByRole("textbox", { name: "سبب الإبلاغ" }), "هذا التعليق يحتوي على إساءة واضحة");
    await user.click(screen.getByRole("button", { name: "إرسال البلاغ" }));

    expect(reportMutate).toHaveBeenCalledWith(expect.objectContaining({
      targetType: "comment",
      reason: "abuse",
      details: "هذا التعليق يحتوي على إساءة واضحة",
    }));
  });

  it("يفتح محرر رد مضمّنًا تحت التعليق المختار بخلفية واضحة", async () => {
    const user = userEvent.setup();
    render(<ArticleComments pageKey="article-test" />);

    await user.click(screen.getByRole("button", { name: "رد" }));
    const replyInput = screen.getByRole("textbox", { name: "ردك" });
    const replyForm = replyInput.closest("form");
    expect(replyForm).not.toBeNull();
    expect(replyForm?.className).toContain("comment-reply-form-inline");
    expect(screen.getByText("رد على زائر")).toBeTruthy();

    await user.type(screen.getByRole("textbox", { name: "اسم العرض" }), "زائر اختبار");
    await user.type(replyInput, "رد مباشر واضح للاختبار");
    await user.click(screen.getByRole("button", { name: "نشر الرد" }));

    expect(submitReplyMutate).toHaveBeenCalledWith(expect.objectContaining({
      commentId: 24,
      parentReplyId: null,
      body: "رد مباشر واضح للاختبار",
    }));
  });
});
