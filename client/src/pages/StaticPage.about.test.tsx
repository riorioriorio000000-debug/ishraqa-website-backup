// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AboutPage } from "./StaticPage";

vi.mock("@/components/SiteShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));

afterEach(cleanup);

describe("صفحة من نحن", () => {
  it("تعرض روابط محلية مرئية إلى ستة أدلة خدمة ومدينة حقيقية", () => {
    const { container } = render(<AboutPage />);

    expect(screen.getByText("من نحن")).toBeTruthy();
    expect(screen.getByText("أدلة محلية ظاهرة، حسب احتياجك.")).toBeTruthy();
    const localLinkGroups = container.querySelectorAll(".service-local-entry-grid");
    expect(localLinkGroups).toHaveLength(2);
    expect(localLinkGroups[1].querySelectorAll("a")).toHaveLength(6);
    expect(localLinkGroups[1].textContent).toMatch(/الرياض/);
    expect(localLinkGroups[1].textContent).toMatch(/جدة/);
    expect(localLinkGroups[1].textContent).toMatch(/مكة/);
  });
});
