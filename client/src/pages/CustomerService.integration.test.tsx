// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CustomerService from "./CustomerService";

vi.mock("@/components/SiteShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: ({
    messages,
    onSendMessage,
  }: {
    messages: Array<{ role: string; content: string }>;
    onSendMessage: (content: string) => void;
  }) => (
    <section>
      <button type="button" onClick={() => onSendMessage("لخّص هذه الصفحة: http://localhost")}>أرسل رابطًا غير مسموح</button>
      {messages.map((message, index) => <p key={`${message.role}-${index}`}>{message.content}</p>)}
    </section>
  ),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    ai: {
      chat: { useMutation: () => ({ mutate: vi.fn(), error: null }) },
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

describe("CustomerService", () => {
  it("يضيف فشل تلخيص الرابط كرسالة مساعد داخل سجل المحادثة", async () => {
    const user = userEvent.setup();
    render(<CustomerService />);

    await user.click(screen.getByRole("button", { name: "أرسل رابطًا غير مسموح" }));

    expect(await screen.findByText(/تعذر تلخيص الرابط الآن\. لا يمكن فتح عنوان محلي\./)).toBeTruthy();
  });
});
