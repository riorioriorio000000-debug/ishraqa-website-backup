import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BrandMark from "./BrandMark";

describe("BrandMark", () => {
  it("يستخدم الشعار الذي اعتمده المستخدم في واجهة الموقع", () => {
    render(<BrandMark size={54} />);

    expect(screen.getByRole("img", { name: "شعار الإشراقة" }).getAttribute("src")).toContain("/media/sofa.jpg");
  });
});
