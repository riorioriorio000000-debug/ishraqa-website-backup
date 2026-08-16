// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ServiceCityPage from "./ServiceCityPage";

vi.mock("wouter", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
  useRoute: () => [true, { serviceSlug: "home-cleaning", citySlug: "riyadh" }],
}));

vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));

afterEach(() => vi.restoreAllMocks());

describe("نموذج الاستفسار السريع", () => {
  it("يفتح واتساب بالتفاصيل المكتوبة والرقم المعتمد دون حقل رقم هاتف", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    render(<ServiceCityPage />);

    await user.type(screen.getByLabelText("الحي"), "النرجس");
    await user.type(screen.getByLabelText("نوع المكان"), "شقة");
    await user.type(screen.getByLabelText("التفاصيل"), "أحتاج تنظيفًا بعد الصيانة");
    await user.click(screen.getByRole("button", { name: /إرسال الاستفسار عبر واتساب/ }));

    expect(open).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/966552610151?text="), "_blank", "noopener,noreferrer");
    expect(decodeURIComponent(String(open.mock.calls[0][0]))).toContain("النرجس");
    expect(screen.queryByLabelText(/رقم الهاتف/)).toBeNull();
  });
});
