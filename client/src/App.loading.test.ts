import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("حالة تحميل الصفحات", () => {
  it("تعرض الفيديو المعتمد بصمت مع نص حالة قابل للقراءة", () => {
    expect(appSource).toContain('className="route-loading-video"');
    expect(appSource).toContain("loader-reference_77ede9ac.webm");
    expect(appSource).toContain("autoPlay muted loop playsInline preload=\"metadata\"");
    expect(appSource).toContain("role=\"status\"");
    expect(appSource).toContain("جارٍ تجهيز الصفحة...");
  });
});
