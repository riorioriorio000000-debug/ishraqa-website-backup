import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

vi.mock("@/components/SiteShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/VisitorFeedback", () => ({ default: () => null }));
vi.mock("@/components/ServiceVideo", () => ({ default: () => null }));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a>,
}));

describe("نموذج الحجز", () => {
  afterEach(() => vi.restoreAllMocks());

  it("يفتح رسالة واتساب جاهزة إلى رقم الإشراقة المعتمد", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<Home />);

    expect(screen.getByRole("link", { name: "تواصل معنا" }).getAttribute("href")).toBe("tel:0509614797");

    await user.click(screen.getByRole("button", { name: /التالي/ }));
    await user.click(screen.getByRole("button", { name: /التالي/ }));
    await user.click(screen.getByRole("button", { name: /التالي/ }));
    await user.click(screen.getByRole("button", { name: /إرسال عبر واتساب/ }));

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/966509614797?text="),
      "_blank",
      "noopener,noreferrer",
    );
    expect(openSpy.mock.calls[0]?.[0]).toContain("0509614797");
  });
});
