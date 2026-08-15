import React from "react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReadingProgress from "./ReadingProgress";

const mocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
}));

vi.mock("wouter", () => ({
  useLocation: mocks.useLocation,
}));

describe("ReadingProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0, writable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 3000 });
  });

  it("يعرض تقدّم المقال ويحفظ النسبة محليًا عند التمرير", () => {
    mocks.useLocation.mockReturnValue(["/articles/cleaning-guide", vi.fn()]);
    render(<ReadingProgress />);

    Object.defineProperty(window, "scrollY", { configurable: true, value: 1000, writable: true });
    act(() => window.dispatchEvent(new Event("scroll")));

    expect(screen.getByLabelText("تقدّم قراءة المقال 50%")).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem("ishraqa-reading-progress:/articles/cleaning-guide") || "{}"))
      .toMatchObject({ progress: 50 });
  });

  it("لا يظهر خارج صفحات المقالات", () => {
    mocks.useLocation.mockReturnValue(["/services", vi.fn()]);
    const { container } = render(<ReadingProgress />);
    expect(container.innerHTML).toBe("");
  });
});
