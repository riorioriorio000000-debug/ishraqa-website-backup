import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import QuickServiceQuestion from "./QuickServiceQuestion";

const { chatMutate, feedbackMutate, recommendUseQuery } = vi.hoisted(() => ({ chatMutate: vi.fn(), feedbackMutate: vi.fn(), recommendUseQuery: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    ai: {
      chat: {
        useMutation: (options: { onSuccess?: (value: { reply: string; workSummary: string[]; navigation: ReadonlyArray<{ label: string; href: string }>; contentCards: Array<{ id: string; kind: string; title: string; description: string; href: string }>; recommendationContext: { service: "maintenance"; city: string } }) => void }) => ({
          mutate: (input: unknown) => {
            chatMutate(input);
            options.onSuccess?.({
              reply: "للمكيفات، ابدأ بمقال الصيانة ثم أرسل تفاصيل المكيف والمدينة.",
              workSummary: ["فهمت سؤال الصيانة.", "راجعت فهرس موقع الإشراقة."],
              navigation: [{ label: "المقالات", href: "/articles" }, { label: "الحجز", href: "/booking" }],
              contentCards: [{ id: "maintenance-guide", kind: "article", title: "دليل صيانة التكييف", description: "خطوات عملية لوصف احتياج الصيانة.", href: "/articles/ac-maintenance-guide" }],
              recommendationContext: { service: "maintenance", city: "الرياض" },
            });
          },
          error: null,
          isPending: false,
        }),
      },
      recommendContent: {
        useQuery: (input: unknown) => {
          recommendUseQuery(input);
          return { data: undefined, isLoading: false };
        },
      },
    },
    feedback: {
      submitAssistantAnswer: {
        useMutation: (options: { onSuccess?: () => void }) => ({
          mutate: (input: unknown) => { feedbackMutate(input); options.onSuccess?.(); },
          error: null,
          isPending: false,
        }),
      },
      assistantAnswerSummary: {
        useQuery: () => ({ data: { count: 3, average: 4.3, noteCount: 2 }, isLoading: false }),
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
  feedbackMutate.mockClear();
  recommendUseQuery.mockClear();
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

  it("يحافظ على فواصل الخطوات العملية داخل نص الإجابة", async () => {
    const user = userEvent.setup();
    render(<QuickServiceQuestion />);

    await user.type(screen.getByLabelText("اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش"), "كيف أنظف بيتي؟");
    await user.click(screen.getByRole("button", { name: /اسأل الآن/ }));

    const reply = await screen.findByText(/للمكيفات، ابدأ بمقال الصيانة/);
    expect(reply.className).toContain("whitespace-pre-line");
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

  it("يحفظ تقييم النجوم وملاحظة اختيارية مع نوع الخدمة والمدينة وبطاقات المحتوى المقترحة", async () => {
    const user = userEvent.setup();
    render(<QuickServiceQuestion />);

    await user.type(screen.getByLabelText("اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش"), "أحتاج صيانة مكيف في الرياض");
    await user.click(screen.getByRole("button", { name: /اسأل الآن/ }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("radio", { name: /4 من 5 نجوم/ }));
    expect(screen.getByRole("radio", { name: /4 من 5 نجوم/ }).className).toContain("selected");
    await user.type(screen.getByLabelText(/ملاحظة إضافية/), "أحتاج خطوات أكثر وضوحًا.");
    await user.click(screen.getByRole("button", { name: "إرسال التقييم" }));

    expect(feedbackMutate).toHaveBeenCalledWith(expect.objectContaining({ rating: 4, service: "maintenance", city: "الرياض", contentCardIds: ["maintenance-guide"], note: "أحتاج خطوات أكثر وضوحًا." }));
    expect(screen.getByRole("status").textContent).toContain("شكرًا، سُجّل تقييمك");
  });

  it("يتيح للزائر تخصيص خدمة ومدينة المقالات المقترحة وطي ملخص التقييمات", async () => {
    const user = userEvent.setup();
    render(<QuickServiceQuestion />);

    await user.type(screen.getByLabelText("اكتب سؤالك عن التنظيف أو الصيانة أو نقل العفش"), "أحتاج صيانة مكيف في الرياض");
    await user.click(screen.getByRole("button", { name: /اسأل الآن/ }));
    await screen.findByRole("dialog");
    await user.selectOptions(screen.getByLabelText("نوع الخدمة"), "cleaning");
    await user.clear(screen.getByLabelText("المدينة أو الحي"));
    await user.type(screen.getByLabelText("المدينة أو الحي"), "جدة");

    expect(recommendUseQuery).toHaveBeenLastCalledWith(expect.objectContaining({ service: "cleaning", city: "جدة" }));
    const summary = screen.getByText("عرض ملخص ملاحظات التقييمات");
    await user.click(summary);
    expect(screen.getByText(/متوسط التقييم 4.3 من 5/)).toBeTruthy();
  });
});
