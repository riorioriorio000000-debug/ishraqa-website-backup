import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { articleEntries } from "@/pages/ArticleDetail";
import ArticleStructuredData from "./ArticleStructuredData";

describe("بيانات المقال المنظمة", () => {
  it("ينشئ BlogPosting يتضمن الرابط والكلمات والشعار", () => {
    const { container } = render(<ArticleStructuredData article={articleEntries[0]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent || "{}");

    expect(data["@type"]).toBe("BlogPosting");
    expect(data.url).toBe("https://al-eshraqa.co/articles/home-cleaning-guide");
    expect(data.keywords).toContain(articleEntries[0].keywords[0]);
    expect(data.publisher.logo.url).toContain("ishraqa-user-logo");
    expect(data.image).toBe(articleEntries[0].shareImage);
    expect(container.querySelector("img")?.getAttribute("alt")).toContain(articleEntries[0].title);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(articleEntries[0].image);
    expect(container.querySelector("img")?.getAttribute("srcset")).toContain("720w");
  });
});
