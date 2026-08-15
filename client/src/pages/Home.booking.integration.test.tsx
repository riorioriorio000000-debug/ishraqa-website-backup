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

vi.mock("@/lib/trpc", () => ({
  trpc: {
    booking: {
      submit: {
        useMutation: ({ onSuccess }: { onSuccess: (result: { notificationSent: boolean }) => void }) => ({
          mutate: () => onSuccess({ notificationSent: true }),
          isPending: false,
          isError: false,
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a>,
}));

describe("نموذج الحجز", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("يرسل الطلب ويعرض رسالة نجاح واضحة تؤكد تنبيه الإدارة", async () => {
    const user = userEvent.setup();

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
    await user.click(screen.getByRole("button", { name: /إرسال الطلب/ }));

    expect(screen.getByRole("status").textContent).toContain("تم استلام طلبك بنجاح.");
    expect(screen.getByText("وصل إشعار فوري إلى إدارة الإشراقة لمراجعة تفاصيلك.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /متابعة عبر واتساب/ }).getAttribute("href")).toContain("https://wa.me/966552610151?text=");
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

  it("يعرض أسئلة شائعة محلية واضحة عن التنظيف والصيانة ونقل العفش", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /إجابات أوضح.*قبل أن تبدأ/ })).toBeTruthy();
    expect(document.querySelectorAll(".home-faq-grid details")).toHaveLength(6);
    expect(screen.getByText("هل يمكن ترتيب تنظيف شقة بعد الانتقال أو قبل التسليم؟")).toBeTruthy();
    expect(screen.getByText("ما المعلومات التي تساعد على تنسيق نقل العفش؟")).toBeTruthy();
  });
});
