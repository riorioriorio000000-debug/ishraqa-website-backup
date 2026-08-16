import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    interactions: {
      unreadNotificationCount: {
        useQuery: mocks.useQuery,
      },
    },
  },
}));

vi.mock("@/lib/visitor", () => ({
  getAnonymousVisitorId: () => "f4ee2f36-6d7f-4e29-8cd9-c6a1e53d4a65",
}));

import NotificationBell from "./NotificationBell";

afterEach(() => {
  cleanup();
  mocks.useQuery.mockReset();
});

describe("جرس الإشعارات", () => {
  it("يعرض عداد الإشعارات غير المقروءة ويربط بالمركز", async () => {
    mocks.useQuery.mockReturnValue({ data: { count: 3 } });
    render(<NotificationBell />);

    const bell = await screen.findByRole("link", { name: "لديك 3 إشعار غير مقروء" });
    expect(bell.getAttribute("href")).toBe("/notifications");
    expect(screen.getByLabelText("3 غير مقروء").textContent).toBe("3");
  });

  it("يقدم تسمية مفهومة عندما لا توجد إشعارات غير مقروءة", async () => {
    mocks.useQuery.mockReturnValue({ data: { count: 0 } });
    render(<NotificationBell />);

    expect((await screen.findByRole("link", { name: "مركز الإشعارات" })).getAttribute("href")).toBe("/notifications");
    expect(screen.queryByLabelText(/غير مقروء/)).toBeNull();
  });
});
