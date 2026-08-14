// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CustomerService from "./CustomerService";

vi.mock("@/components/SiteShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: ({
    messages,
    onSendMessage,
  }: {
    messages: Array<{ role: string; content: string; contentCards?: Array<{ title: string; href: string }> }>;
    onSendMessage: (content: string) => void;
  }) => (
    <section>
      <button type="button" onClick={() => onSendMessage("لخّص هذه الصفحة: http://localhost")}>أرسل رابطًا غير مسموح</button>
      <button type="button" onClick={() => onSendMessage("أحتاج إلى تنظيف شقة")}>اسأل عن التنظيف</button>
      {messages.map((message, index) => <div key={`${message.role}-${index}`}><p>{message.content}</p>{message.contentCards?.map((card) => <a key={card.href} href={card.href}>{card.title}</a>)}</div>)}
    </section>
  ),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    ai: {
      chat: {
        useMutation: (options: { onSuccess?: (value: { reply: string; contentCards: Array<{ id: string; kind: "service" | "article" | "video"; title: string; description: string; href: string }> }) => void }) => ({
          mutate: () => options.onSuccess?.({
            reply: "هذه المسارات المناسبة لطلب تنظيف الشقة.",
            contentCards: [
              { id: "cleaning-service", kind: "service", title: "تنظيف المنازل", description: "خدمة", href: "/services" },
              { id: "cleaning-guide", kind: "article", title: "دليل تنظيف المنزل", description: "مقالة", href: "/articles/home-cleaning-guide" },
              { id: "cleaning-video", kind: "video", title: "مرئي خدمة التنظيف", description: "مرئي", href: "/" },
            ],
          }),
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

afterEach(() => cleanup());

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
});
