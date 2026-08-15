// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { articleEntries } from "./ArticleDetail";
import { ArticlesPage } from "./StaticPage";

vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    interactions: {
      articleFeedbackSummaries: { useQuery: () => ({ data: {}, refetch: vi.fn() }) },
      submitArticleFeedback: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

afterEach(() => cleanup());

describe("بحث مكتبة المقالات", () => {
  it("يرشح بحسب اسم المدينة ويعرض حالة واضحة عند عدم وجود نتائج", () => {
    render(<ArticlesPage />);
    const search = screen.getByRole("searchbox", { name: "البحث في المقالات" });

    fireEvent.change(search, { target: { value: "الرياض" } });
    expect(screen.getByText(/شركة تنظيف منازل الرياض:/)).toBeTruthy();
    expect(screen.queryByText(/شركة صيانة تكييف جدة:/)).toBeNull();
    expect(screen.getByText("إجمالي النتائج: 1 مقالة")).toBeTruthy();

    fireEvent.change(search, { target: { value: "عبارة لا تطابق أي مقال" } });
    expect(screen.getByText("لا توجد مقالة مطابقة لهذه التصفية بعد.")).toBeTruthy();
  });

  it("يتيح تصفية المقالات بحسب نوع الخدمة مع نتيجة مفهومة للزائر", () => {
    render(<ArticlesPage />);

    const serviceFilter = screen.getByLabelText("تصفية المقالات حسب نوع الخدمة") as HTMLSelectElement;
    fireEvent.change(serviceFilter, { target: { value: "maintenance" } });

    expect(serviceFilter.value).toBe("maintenance");
    expect(screen.getByText(/إجمالي النتائج:/)).toBeTruthy();
    expect(screen.queryByText(/شركة نقل عفش/)).toBeNull();
  });

  it("يتيح مرشح مدينة مستقلًا ويحدّث إجمالي النتائج بعد اختياره", () => {
    render(<ArticlesPage />);
    const cityFilter = screen.getByLabelText("تصفية المقالات حسب المدينة") as HTMLSelectElement;

    fireEvent.change(cityFilter, { target: { value: "الرياض" } });

    expect(cityFilter.value).toBe("الرياض");
    expect(screen.getByText("إجمالي النتائج: 1 مقالة")).toBeTruthy();
    expect(screen.getByText(/شركة تنظيف منازل الرياض:/)).toBeTruthy();
    expect(screen.queryByText(/شركة صيانة تكييف جدة:/)).toBeNull();
  });

  it("يعرض أربعة أدلة رئيسية فقط مع صور معتمدة ويبقي المكتبة عند 62 مقالة", () => {
    const { container } = render(<ArticlesPage />);

    expect(container.querySelectorAll(".featured-article-card")).toHaveLength(4);
    expect(container.querySelectorAll(".featured-article-media img")).toHaveLength(4);
    expect(container.querySelectorAll(".secondary-article-grid article")).toHaveLength(58);
  });

  it("يعرض لمحة سريعة قابلة للقراءة وشارة جديد للأدلة المحلية الحديثة", () => {
    const { container } = render(<ArticlesPage />);

    expect(screen.getAllByText("لمحة سريعة")).toHaveLength(62);
    expect(container.querySelectorAll(".article-card-preview")).toHaveLength(62);
    expect(screen.getAllByText("جديد")).toHaveLength(12);
  });

  it("يعرض تاريخ نشر فعليًا ومقروءًا على كل بطاقة مقال", () => {
    const { container } = render(<ArticlesPage />);

    expect(articleEntries.every((article) => Boolean(article.publishedAt))).toBe(true);
    expect(container.querySelectorAll("time.article-published-date")).toHaveLength(62);
    expect(screen.getAllByText(/نُشر في/)).toHaveLength(62);
  });

  it("يفرز الأدلة المحلية أبجديًا أو حسب تاريخ الإضافة دون إخفاء العناوين المحلية", () => {
    const { container } = render(<ArticlesPage />);
    const sort = screen.getByLabelText("فرز المقالات حسب المدينة أو تاريخ الإضافة") as HTMLSelectElement;
    const localArticles = articleEntries.filter((article) => article.category === "دليل محلي");

    fireEvent.change(sort, { target: { value: "city" } });
    const expectedFirstCityTitle = [...localArticles].sort((first, second) => {
      const firstCity = first.intro.match(/لسكان\s+(.+?)\s+يشرح/)?.[1] ?? "";
      const secondCity = second.intro.match(/لسكان\s+(.+?)\s+يشرح/)?.[1] ?? "";
      return firstCity.localeCompare(secondCity, "ar");
    })[0]?.title;
    expect((container.querySelector(".local-article-grid h3")?.textContent ?? "").trim()).toBe(expectedFirstCityTitle);

    fireEvent.change(sort, { target: { value: "newest" } });
    expect(sort.value).toBe("newest");
    expect((container.querySelector(".local-article-grid h3")?.textContent ?? "").trim()).toBe(localArticles.at(-1)?.title);
    expect(container.querySelector(".article-filter-status")?.textContent).toContain("الأحدث إضافة");
  });

  it("يضم صورًا وملاحظات تحريرية مواءمة داخل الأدلة الرئيسية من دون الاسم السابق", () => {
    const mainArticles = articleEntries.filter((article) => article.category === "دليل رئيسي");

    expect(mainArticles).toHaveLength(4);
    expect(mainArticles.every((article) => article.image && article.imageAlt)).toBe(true);
    expect(mainArticles.flatMap((article) => article.sections).map(([, body]) => body).join(" ")).not.toContain("الخيال كلين");
    expect(mainArticles.find((article) => article.slug === "kitchen-care-guide")?.sections.map(([heading]) => heading)).toContain("الدهون المتراكمة تحتاج تدرجًا");
  });

  it("يصوغ عناوين الأدلة المحلية بحسب الخدمة والمدينة دون حشوٍ متكرر", () => {
    const localArticles = articleEntries.filter((article) => article.category === "دليل محلي");
    expect(articleEntries.find((article) => article.slug === "home-cleaning-guide")?.title).toBe("شركة تنظيف منازل: دليل ترتيب طلب الخدمة");
    expect(localArticles.find((article) => article.slug === "riyadh-service-guide")?.title).toBe("شركة تنظيف منازل الرياض: ترتيب طلب الخدمة");
    expect(localArticles.find((article) => article.slug === "jeddah-service-guide")?.title).toBe("شركة صيانة تكييف جدة: ترتيب الفحص");
    expect(localArticles.every((article) => /شركة (تنظيف|صيانة|نقل|خدمات منزلية)/.test(article.title))).toBe(true);
  });
});
