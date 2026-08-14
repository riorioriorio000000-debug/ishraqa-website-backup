// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CustomerService from "./CustomerService";

const { chatMutate } = vi.hoisted(() => ({ chatMutate: vi.fn() }));

vi.mock("@/components/SiteShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: ({
    messages,
    onSendMessage,
    onClearConversation,
  }: {
    messages: Array<{
      role: string;
      content: string;
      workSummary?: string[];
      navigation?: ReadonlyArray<{ label: string; href: string }>;
      contentCards?: Array<{ title: string; href: string }>;
    }>;
    onSendMessage: (content: string) => void;
    onClearConversation?: () => void;
  }) => (
    <section>
      <button type="button" onClick={() => onSendMessage("لخّص هذه الصفحة: http://localhost")}>أرسل رابطًا غير مسموح</button>
      <button type="button" onClick={() => onSendMessage("أحتاج إلى تنظيف شقة")}>اسأل عن التنظيف</button>
      {messages.length > 0 && onClearConversation && <button type="button" onClick={onClearConversation}>احذف السجل</button>}
      {messages.map((message, index) => <div key={`${message.role}-${index}`}><p>{message.content}</p>{message.workSummary?.map((step) => <small key={step}>{step}</small>)}{message.navigation?.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}{message.contentCards?.map((card) => <a key={card.href} href={card.href}>{card.title}</a>)}</div>)}
    </section>
  ),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    ai: {
      chat: {
        useMutation: (options: { onSuccess?: (value: { reply: string; workSummary: string[]; navigation: ReadonlyArray<{ label: string; href: string }>; contentCards: Array<{ id: string; kind: "service" | "article" | "video"; title: string; description: string; href: string }> }) => void }) => ({
          mutate: (input: unknown) => {
            chatMutate(input);
            options.onSuccess?.({
            reply: "هذه المسارات المناسبة لطلب تنظيف الشقة.",
            workSummary: ["فهمت سؤال التنظيف.", "راجعت معلومات موقع الإشراقة."],
            navigation: [{ label: "الخدمات", href: "/services" }],
            contentCards: [
              { id: "cleaning-service", kind: "service", title: "تنظيف المنازل", description: "خدمة", href: "/services" },
              { id: "cleaning-guide", kind: "article", title: "دليل تنظيف المنزل", description: "مقالة", href: "/articles/home-cleaning-guide" },
              { id: "cleaning-video", kind: "video", title: "مرئي خدمة التنظيف", description: "مرئي", href: "/" },
            ],
          });
          },
          error: null,
        }),
      },
      browseAndSummarize: {
        useMutation: (options: { onError?: (error: Error) => void }) => ({
          mutate: () => options.onError?.(new Error("لا يمكن فتح عنوان محلي.")),
          error: null,
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  chatMutate.mockClear();
});

describe("CustomerService", () => {
  it("يضيف فشل تلخيص الرابط كرسالة مساعد داخل سجل المحادثة", async () => {
    const user = userEvent.setup();
    render(<CustomerService />);

    await user.click(screen.getByRole("button", { name: "أرسل رابطًا غير مسموح" }));

    expect(await screen.findByText(/تعذر تلخيص الرابط الآن\. لا يمكن فتح عنوان محلي\./)).toBeTruthy();
  });

  it("يمرر بطاقات الخدمات والمقال والمرئي إلى رسالة المساعد", async () => {
    const user = userEvent.setup();
    render(<CustomerService />);

    await user.click(screen.getByRole("button", { name: "اسأل عن التنظيف" }));

    expect((await screen.findByRole("link", { name: "تنظيف المنازل" })).getAttribute("href")).toBe("/services");
    expect(screen.getByRole("link", { name: "دليل تنظيف المنزل" }).getAttribute("href")).toBe("/articles/home-cleaning-guide");
    expect(screen.getByRole("link", { name: "مرئي خدمة التنظيف" }).getAttribute("href")).toBe("/");
  });

  it("يمرر سياق الصفحة ويحتفظ بملخص إجراءات المساعد وروابطه", async () => {
    const user = userEvent.setup();
    render(<CustomerService />);

    await user.click(screen.getByRole("button", { name: "اسأل عن التنظيف" }));

    expect(chatMutate).toHaveBeenCalledWith(expect.objectContaining({
      pageContext: { title: "خدمة العملاء الذكية", url: "/customer-service" },
    }));
    expect(await screen.findByText("فهمت سؤال التنظيف.")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "الخدمات" }).some((link) => link.getAttribute("href") === "/services")).toBe(true);
  });

  it("يحذف سجل المحادثة من الواجهة عند اختيار حذف السجل", async () => {
    const user = userEvent.setup();
    render(<CustomerService />);

    await user.click(screen.getByRole("button", { name: "اسأل عن التنظيف" }));
    expect(await screen.findByText("هذه المسارات المناسبة لطلب تنظيف الشقة.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "احذف السجل" }));

    expect(screen.queryByText("هذه المسارات المناسبة لطلب تنظيف الشقة.")).toBeNull();
  });

  it("يوفر روابط وصول سريعة ذات مسارات داخلية وتلميحًا واضحًا لتلخيص الروابط", () => {
    render(<CustomerService />);

    const navigation = screen.getByRole("navigation", { name: "روابط وصول سريعة" });
    expect(navigation.querySelector('a[href="/services"]')).toBeTruthy();
    expect(navigation.querySelector('a[href="/articles"]')).toBeTruthy();
    expect(navigation.querySelector('a[href="/where-we-work"]')).toBeTruthy();
    expect(navigation.querySelector('a[href="/booking"]')).toBeTruthy();
    expect(screen.getByText(/عند لصق رابط عام، تُقرأ الصفحة المتاحة فقط لتلخيصها/)).toBeTruthy();
  });
});
