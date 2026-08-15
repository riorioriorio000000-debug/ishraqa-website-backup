import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./SiteShell";

vi.mock("./BrandMark", () => ({ default: () => <span>شعار الإشراقة</span> }));
vi.mock("wouter", () => ({
  Link: ({ href, children, className, onClick, ...props }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) => <a href={href} className={className} onClick={onClick} {...props}>{children}</a>,
  useLocation: () => ["/", vi.fn()],
}));

afterEach(cleanup);

describe("SiteHeader", () => {
  it("يضع الرئيسية أول روابط التصفح ويبرزها بالفئة البصرية المعتمدة", () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole("navigation", { name: "التنقل الرئيسي" });
    const links = within(navigation).getAllByRole("link");
    expect(links[0].textContent).toContain("الرئيسية");
    expect(links[0].getAttribute("href")).toBe("/");
    expect(links[0].className).toContain("nav-home-link");
    expect(within(navigation).queryByRole("link", { name: "نطاق الخدمة" })).toBeNull();
  });

  it("يبقي أين نعمل داخل قائمة المزيد بدلاً من رابط نطاق الخدمة القديم", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    await user.click(screen.getByRole("button", { name: /المزيد/ }));
    expect(screen.getByRole("menuitem", { name: "أين نعمل" }).getAttribute("href")).toBe("/where-we-work");
  });
});
