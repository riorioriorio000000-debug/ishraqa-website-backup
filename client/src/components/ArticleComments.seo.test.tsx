import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/components/ArticleComments.tsx"), "utf8");

describe("النصوص البديلة للصور الرمزية في التعليقات", () => {
  it("يصف صورة صاحب التعليق وصورة صاحب الرد بدل تركها فارغة", () => {
    expect(source).toContain("alt={`صورة رمزية لـ ${reply.displayName}`}");
    expect(source).toContain("alt={`صورة رمزية لـ ${comment.displayName}`}");
  });
});
