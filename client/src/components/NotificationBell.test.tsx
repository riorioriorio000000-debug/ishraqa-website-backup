import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  unreadUseQuery: vi.fn(),
  preferencesUseQuery: vi.fn(),
  playReplyNotificationSound: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    interactions: {
      unreadNotificationCount: {
        useQuery: mocks.unreadUseQuery,
      },
      notificationPreferences: {
        useQuery: mocks.preferencesUseQuery,
      },
    },
  },
}));

vi.mock("@/lib/visitor", () => ({
  getAnonymousVisitorId: () => "f4ee2f36-6d7f-4e29-8cd9-c6a1e53d4a65",
}));

vi.mock("@/lib/notificationSound", () => ({
  playReplyNotificationSound: mocks.playReplyNotificationSound,
  shouldPlayReplyNotificationSound: (previousReplyId: number | undefined, latestReplyId: number | null | undefined, replySoundEnabled: boolean) => Boolean(replySoundEnabled && previousReplyId !== undefined && latestReplyId && latestReplyId > previousReplyId),
}));

import NotificationBell from "./NotificationBell";

afterEach(() => {
  cleanup();
  mocks.unreadUseQuery.mockReset();
  mocks.preferencesUseQuery.mockReset();
  mocks.playReplyNotificationSound.mockClear();
});

describe("جرس الإشعارات", () => {
  it("يعرض عداد الإشعارات غير المقروءة ويربط بالمركز", async () => {
    mocks.unreadUseQuery.mockReturnValue({ data: { count: 3 } });
    mocks.preferencesUseQuery.mockReturnValue({ data: { replySoundEnabled: false } });
    render(<NotificationBell />);

    const bell = await screen.findByRole("link", { name: "لديك 3 إشعار غير مقروء" });
    expect(bell.getAttribute("href")).toBe("/notifications");
    expect(screen.getByLabelText("3 غير مقروء").textContent).toBe("3");
  });

  it("يقدم تسمية مفهومة عندما لا توجد إشعارات غير مقروءة", async () => {
    mocks.unreadUseQuery.mockReturnValue({ data: { count: 0 } });
    mocks.preferencesUseQuery.mockReturnValue({ data: { replySoundEnabled: false } });
    render(<NotificationBell />);

    expect((await screen.findByRole("link", { name: "مركز الإشعارات" })).getAttribute("href")).toBe("/notifications");
    expect(screen.queryByLabelText(/غير مقروء/)).toBeNull();
  });

  it("يشغّل صوتًا فقط عندما يصل رد أحدث بعد تحميل الصفحة ويفعّله الزائر", async () => {
    let unreadData = { count: 1, latestUnreadReplyId: 41 };
    mocks.unreadUseQuery.mockImplementation(() => ({ data: unreadData }));
    mocks.preferencesUseQuery.mockReturnValue({ data: { replySoundEnabled: true } });
    const view = render(<NotificationBell />);
    expect(mocks.playReplyNotificationSound).not.toHaveBeenCalled();

    unreadData = { count: 2, latestUnreadReplyId: 42 };
    view.rerender(<NotificationBell />);
    await waitFor(() => expect(mocks.playReplyNotificationSound).toHaveBeenCalledTimes(1));
  });
});
