// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArticleComments from "./ArticleComments";

const { reactMutate, submitMutate, undoMutate, setCommentsData, toastSuccess } = vi.hoisted(() => ({
  reactMutate: vi.fn(),
  submitMutate: vi.fn(),
  undoMutate: vi.fn(),
  setCommentsData: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ interactions: { listComments: { setData: setCommentsData } } }),
    interactions: {
      listComments: { useQuery: () => ({
        data: [{ id: 24, displayName: "زائر", body: "تعليق صالح للاختبار", avatarKind: "wave", avatarUrl: null, rating: null, hearts: 2, broken: 0, viewerReaction: null, isOwner: false }],
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
      reportContent: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      submitReply: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      reactToReply: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess } }));

afterEach(() => {
  cleanup();
  reactMutate.mockClear();
  submitMutate.mockClear();
  undoMutate.mockClear();
  setCommentsData.mockClear();
  toastSuccess.mockClear();
  localStorage.clear();
});

describe("ArticleComments", () => {
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
    expect(toastSuccess).toHaveBeenCalledWith("تم نشر تعليقك.", expect.objectContaining({ action: expect.objectContaining({ label: "تراجع" }) }));
    const notificationOptions = toastSuccess.mock.calls[0][1] as { action: { onClick: () => void } };
    notificationOptions.action.onClick();
    expect(undoMutate).toHaveBeenCalledWith(expect.objectContaining({ commentId: 61 }));
  });
});
