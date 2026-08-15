import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RouteScrollTop from "./RouteScrollTop";

const mocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
}));

vi.mock("wouter", () => ({
  useLocation: mocks.useLocation,
}));

describe("RouteScrollTop", () => {
  beforeEach(() => {
    mocks.useLocation.mockReturnValue(["/", vi.fn()]);
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("يعيد موضع التمرير إلى البداية عند تغيّر المسار", () => {
    const { rerender } = render(<RouteScrollTop />);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "auto" });

    mocks.useLocation.mockReturnValue(["/booking", vi.fn()]);
    rerender(<RouteScrollTop />);

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
