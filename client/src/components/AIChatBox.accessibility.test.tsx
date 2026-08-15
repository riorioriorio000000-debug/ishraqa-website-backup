/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AIChatBox } from "./AIChatBox";

vi.mock("streamdown", () => ({ Streamdown: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

afterEach(() => cleanup());

describe("وصول واجهة مساعد الإشراقة", () => {
  it("يوفر سجلًا حيًا وإدخالًا مسمى وبطاقة محتوى ذات رابط داخلي", () => {
    const onSendMessage = vi.fn();
    render(<AIChatBox
      messages={[{ role: "assistant", content: "يمكنك قراءة الدليل التالي.", contentCards: [{ id: "guide", kind: "article", title: "دليل تنظيف المنزل", description: "خطوات منزلية عملية.", href: "/articles/home-cleaning-guide" }] }]}
      onSendMessage={onSendMessage}
      quickActions={[{ label: "تلخيص صفحة عامة", prompt: "لخّص هذه الصفحة" }]}
    />);

    expect(screen.getByRole("log", { name: "محادثة خدمة العملاء" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "اكتب سؤالك لخدمة العملاء" })).toBeTruthy();
    const card = screen.getByRole("link", { name: /دليل تنظيف المنزل/ });
    expect(card.getAttribute("href")).toBe("/articles/home-cleaning-guide");
  });

  it("يبقي الإجراء السريع قابلاً للوصول والتركيز قبل بدء المحادثة", () => {
    render(<AIChatBox messages={[]} onSendMessage={vi.fn()} quickActions={[{ label: "تلخيص صفحة عامة", prompt: "لخّص هذه الصفحة" }]} />);

    const quickAction = screen.getByRole("button", { name: "تلخيص صفحة عامة" });
    quickAction.focus();
    expect(document.activeElement).toBe(quickAction);
  });

  it("يرسل السؤال بمفتاح Enter ويحافظ على تركيز الإدخال", () => {
    const onSendMessage = vi.fn();
    render(<AIChatBox messages={[]} onSendMessage={onSendMessage} />);
    const input = screen.getByRole("textbox", { name: "اكتب سؤالك لخدمة العملاء" });

    fireEvent.change(input, { target: { value: "كيف أحجز؟" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSendMessage).toHaveBeenCalledWith("كيف أحجز؟");
    expect(document.activeElement).toBe(input);
  });

  it("يعلن حالة الانتظار ويعطل الإرسال أثناء معالجة المساعد", () => {
    render(<AIChatBox messages={[{ role: "user", content: "أحتاج مساعدة" }]} onSendMessage={vi.fn()} isLoading />);

    expect(screen.getByRole("status").textContent).toContain("يتحقق المساعد من التفاصيل");
    expect((screen.getByRole("button", { name: "المساعد يعالج سؤالك" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
