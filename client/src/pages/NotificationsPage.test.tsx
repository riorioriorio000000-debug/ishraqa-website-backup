// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listNotificationsUseQuery: vi.fn(),
  markReadMutate: vi.fn(),
  requestRecheckMutate: vi.fn(),
  unreadInvalidate: vi.fn(),
}));

vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));
vi.mock("@/lib/visitor", () => ({ getAnonymousVisitorId: () => "f4ee2f36-6d7f-4e29-8cd9-c6a1e53d4a65" }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ interactions: { unreadNotificationCount: { invalidate: mocks.unreadInvalidate } } }),
    interactions: {
      listNotifications: { useQuery: mocks.listNotificationsUseQuery },
      markNotificationsRead: { useMutation: () => ({ mutate: mocks.markReadMutate, isPending: false }) },
    },
    moderation: { requestRecheck: { useMutation: () => ({ mutate: mocks.requestRecheckMutate, isPending: false }) } },
  },
}));

import NotificationsPage from "./NotificationsPage";

afterEach(() => {
  cleanup();
  mocks.listNotificationsUseQuery.mockReset();
  mocks.markReadMutate.mockReset();
  mocks.requestRecheckMutate.mockReset();
  mocks.unreadInvalidate.mockReset();
});

describe("مركز الإشعارات", () => {
  it("يفلتر حالة القراءة ويفتح الإشعار مع تعليم غير المقروء كمقروء", async () => {
    mocks.listNotificationsUseQuery.mockReturnValue({
      data: [
        { id: 7, type: "reply", title: "رد جديد على تعليقك", message: "سارة كتبت ردًا مفيدًا على تعليقك حول تنظيف المكيفات.", targetPath: "/articles/ac", entityType: "reply", entityId: 14, isRead: false, createdAt: new Date("2026-08-16T10:00:00Z"), actorDisplayName: "سارة", actorAvatarKind: "leaf", actorAvatarUrl: "/manus-storage/sara-avatar.png" },
        { id: 8, type: "reaction", title: "تفاعل جديد على تعليقك", message: "أحمد أبدى إعجابه بتعليقك.", targetPath: "/articles/jeddah", entityType: "comment", entityId: 9, isRead: true, createdAt: new Date("2026-08-15T10:00:00Z"), actorDisplayName: "أحمد", actorAvatarKind: "star", actorAvatarUrl: null },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationsPage />);
    expect(await screen.findByText("رد جديد على تعليقك")).toBeTruthy();
    expect(screen.getByText("تفاعل جديد على تعليقك")).toBeTruthy();
    expect(screen.getByText("سارة")).toBeTruthy();
    expect(screen.getByAltText("صورة سارة").getAttribute("src")).toBe("/manus-storage/sara-avatar.png");
    expect(screen.getByText("أحمد")).toBeTruthy();
    expect(screen.getByLabelText("صورة أحمد")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /غير مقروءة/ }));
    expect(screen.getByText("رد جديد على تعليقك")).toBeTruthy();
    expect(screen.queryByText("تفاعل جديد على تعليقك")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /فتح الإشعار/ }));
    await waitFor(() => expect(mocks.markReadMutate).toHaveBeenCalledWith({ visitorId: "f4ee2f36-6d7f-4e29-8cd9-c6a1e53d4a65", ids: [7] }));
    expect(screen.getByRole("button", { name: /إخفاء التفاصيل/ })).toBeTruthy();
  });
});
