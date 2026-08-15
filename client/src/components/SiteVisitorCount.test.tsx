// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const record = vi.fn();
const refetch = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    interactions: {
      visitorCount: { useQuery: () => ({ data: 42, refetch }) },
      recordVisitor: { useMutation: ({ onSuccess }: { onSuccess: () => void }) => ({ mutate: (input: unknown) => { record(input); onSuccess(); } }) },
    },
  },
}));

import SiteVisitorCount from "./SiteVisitorCount";

afterEach(() => {
  cleanup();
  localStorage.clear();
  record.mockClear();
  refetch.mockClear();
  vi.restoreAllMocks();
});

describe("عداد الزوار الفريد", () => {
  it("يسجل معرف الزائر مرة ويعرض العدد المعاد من الخادم", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    render(<SiteVisitorCount />);

    const visitorCounter = document.querySelector(".footer-visitor-count");
    expect(visitorCounter?.textContent).toContain("42");
    expect(visitorCounter?.textContent).toContain("زائرًا للموقع");
    expect(record).toHaveBeenCalledWith({ visitorId: "3fa85f64-5717-4562-b3fc-2c963f66afa6" });
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
