import { describe, expect, it } from "vitest";
import { usesPlatformAuth } from "./runtimeAuthMode";

describe("runtime authentication mode", () => {
  it("keeps the platform sign-in behavior by default", () => {
    expect(usesPlatformAuth(undefined)).toBe(true);
    expect(usesPlatformAuth("manus")).toBe(true);
  });

  it("disables platform-only redirects in the external trial", () => {
    expect(usesPlatformAuth("external")).toBe(false);
  });
});
