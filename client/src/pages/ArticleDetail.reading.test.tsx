// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArticleDetailPage, { articleEntries } from "./ArticleDetail";

vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));
vi.mock("@/components/ArticleStructuredData", () => ({ default: () => null }));
vi.mock("@/components/ArticleRating", () => ({ default: () => <div>تقييم المقال</div> }));
vi.mock("@/components/ArticleComments", () => ({ default: () => <div>تعليقات المقال</div> }));
vi.mock("wouter", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a>,
  useRoute: () => [true, { slug: articleEntries[0].slug }],
}));

afterEach(cleanup);

describe("قارئ المقالات", () => {
  it("ينقل الدليل الإرشادي إلى الإطار الختامي ويُبقي عنوانًا تقنيًا واحدًا فقط", () => {
    const article = articleEntries[0];
    render(<ArticleDetailPage />);

    expect(screen.getAllByRole("heading", { level: 1, name: article.title })).toHaveLength(1);
    expect(screen.getAllByText(article.intro)).toHaveLength(1);
    expect(document.querySelector(".article-hero-compact")).toBeTruthy();
    expect(document.querySelector(".article-reading-intro")).toBeNull();
    expect(document.querySelector(".article-primary-guide")?.textContent).toContain("قراءة إرشادية من الإشراقة");
    expect(document.querySelector(".article-detail")?.className).toMatch(/article-tone-[1-5]/);
  });
});
