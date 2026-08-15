// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

describe("بحث مكتبة المقالات", () => {
  it("يرشح بحسب اسم المدينة ويعرض حالة واضحة عند عدم وجود نتائج", () => {
    render(<ArticlesPage />);
    const search = screen.getByRole("searchbox", { name: "البحث في المقالات" });

    fireEvent.change(search, { target: { value: "الرياض" } });
    expect(screen.getByText(/دليل الرياض:/)).toBeTruthy();
    expect(screen.queryByText(/دليل جدة:/)).toBeNull();
    expect(screen.getByText("نتائج البحث: 1 مقالة")).toBeTruthy();

    fireEvent.change(search, { target: { value: "عبارة لا تطابق أي مقال" } });
    expect(screen.getByText("لا توجد مقالة مطابقة بعد.")).toBeTruthy();
  });

  it("يعرض أربعة أدلة رئيسية فقط مع صور معتمدة ويبقي المكتبة عند 62 مقالة", () => {
    const { container } = render(<ArticlesPage />);

    expect(container.querySelectorAll(".featured-article-card")).toHaveLength(4);
    expect(container.querySelectorAll(".featured-article-media img")).toHaveLength(4);
    expect(container.querySelectorAll(".secondary-article-grid article")).toHaveLength(58);
  });

  it("يضم صورًا وملاحظات تحريرية مواءمة داخل الأدلة الرئيسية من دون الاسم السابق", () => {
    const mainArticles = articleEntries.filter((article) => article.category === "دليل رئيسي");

    expect(mainArticles).toHaveLength(4);
    expect(mainArticles.every((article) => article.image && article.imageAlt)).toBe(true);
    expect(mainArticles.flatMap((article) => article.sections).map(([, body]) => body).join(" ")).not.toContain("الخيال كلين");
    expect(mainArticles.find((article) => article.slug === "kitchen-care-guide")?.sections.map(([heading]) => heading)).toContain("الدهون المتراكمة تحتاج تدرجًا");
  });
});
