import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import QuickServiceQuestion from "./QuickServiceQuestion";

const { chatMutate } = vi.hoisted(() => ({ chatMutate: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    ai: {
      chat: {
        useMutation: (options: { onSuccess?: (value: { reply: string; workSummary: string[]; navigation: ReadonlyArray<{ label: string; href: string }>; contentCards: Array<{ id: string; kind: string; title: string; description: string; href: string }> }) => void }) => ({
          mutate: (input: unknown) => {
            chatMutate(input);
            options.onSuccess?.({
              reply: "للمكيفات، ابدأ بمقال الصيانة ثم أرسل تفاصيل المكيف والمدينة.",
              workSummary: ["فهمت سؤال الصيانة.", "راجعت فهرس موقع الإشراقة."],
              navigation: [{ label: "المقالات", href: "/articles" }, { label: "الحجز", href: "/booking" }],
              contentCards: [{ id: "maintenance-guide", kind: "article", title: "دليل صيانة التكييف", description: "خطوات عملية لوصف احتياج الصيانة.", href: "/articles/ac-maintenance-guide" }],
            });
          },
          error: null,
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, onClick, className }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => <a href={href} onClick={onClick} className={className}>{children}</a>,
}));

afterEach(() => {
  cleanup();
  chatMutate.mockClear();
});

describe("QuickServiceQuestion", () => {
  it("يعرض إجابة المساعد داخل نافذة مركزية مع روابط المقالات والصفحات", async () => {
    const user = userEvent.setup();
    render(<QuickServiceQuestion />);

    await user.type(screen.getByLabelText("اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش"), "أين أجد مقالة صيانة المكيفات؟");
    await user.click(screen.getByRole("button", { name: /اسأل الآن/ }));

    expect(chatMutate).toHaveBeenCalledWith(expect.objectContaining({ pageContext: { title: "الأسئلة الشائعة", url: "/faq" } }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/للمكيفات، ابدأ بمقال الصيانة/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /دليل صيانة التكييف/ }).getAttribute("href")).toBe("/articles/ac-maintenance-guide");
    expect(screen.getByRole("link", { name: /المقالات/ }).getAttribute("href")).toBe("/articles");
    expect(screen.getByRole("link", { name: /الحجز/ }).getAttribute("href")).toBe("/booking");
  });

  it("يغلق النافذة عند استخدام زر الإغلاق الظاهر", async () => {
    const user = userEvent.setup();
    render(<QuickServiceQuestion />);

    await user.type(screen.getByLabelText("اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش"), "أحتاج صيانة مكيف");
    await user.click(screen.getByRole("button", { name: /اسأل الآن/ }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "إغلاق إجابة المساعد" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
