// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArticlesPage } from "./StaticPage";

vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));

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
});
