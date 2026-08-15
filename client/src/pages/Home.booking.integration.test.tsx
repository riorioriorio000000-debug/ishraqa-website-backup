import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
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
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("يفتح رسالة واتساب جاهزة إلى رقم الإشراقة المعتمد", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<Home />);

    expect(screen.getByRole("link", { name: "تواصل عبر واتساب" }).getAttribute("href")).toBe("https://wa.me/966552610151");

    await user.type(screen.getByLabelText("اكتب مدينتك أو الحي"), "حي النزهة، جدة");
    await user.click(screen.getByRole("button", { name: /التالي/ }));
    await user.type(screen.getByLabelText("اكتب نوع الخدمة التي تحتاجها"), "تنظيف شقة");
    await user.type(screen.getByLabelText("أي تفاصيل تهمك؟"), "ثلاث غرف وصالة");
    await user.click(screen.getByRole("button", { name: /التالي/ }));
    await user.type(screen.getByLabelText("اكتب الموعد المفضل"), "الخميس");
    await user.type(screen.getByLabelText("اكتب الوقت المفضل"), "بعد المغرب");
    await user.type(screen.getByLabelText(/رقم التواصل/), "0552610151");
    await user.click(screen.getByRole("button", { name: /إرسال عبر واتساب/ }));

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/966552610151?text="),
      "_blank",
      "noopener,noreferrer",
    );
    expect(openSpy.mock.calls[0]?.[0]).toContain("966552610151");
  });

  it("يعرض كل صور الصفحة الرئيسية بنص بديل وصفي بعد التصيير", () => {
    render(<Home />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(6);
    images.forEach((image) => expect(image.getAttribute("alt")?.trim()).not.toBe(""));
    images.forEach((image) => expect(image.getAttribute("srcset")).toMatch(/\b\d{3}w\b/));
    images.forEach((image) => expect(image.getAttribute("sizes")?.trim()).not.toBe(""));
    expect(screen.getByAltText("رسم شفاف لصندوق أدوات تنظيف الإشراقة")).toBeTruthy();
    expect(screen.getByAltText("خريطة مدن تغطية شركة الإشراقة في السعودية")).toBeTruthy();
  });

  it("يفصل عنوان الترويسة إلى سطرين واضحين بدل تداخل النص", () => {
    render(<Home />);

    const title = screen.getByRole("heading", { level: 1, name: /بيتك أنظف.*يومك أخف/ });
    expect(title.className).toContain("hero-dust-title");
    expect(title.querySelectorAll("span, em")).toHaveLength(2);
    expect(title.querySelector("span")?.textContent).toBe("بيتك أنظف.");
    expect(title.querySelector("em")?.textContent).toBe("يومك أخف.");
  });
});
