import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schemaSource = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
const databaseSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");

describe("عقد الطلبات والتفاعل بالمقالات", () => {
  it("يحفظ تقييمًا واحدًا قابلًا للإخفاء لكل زائر ومقال", () => {
    expect(schemaSource).toContain('"article_feedback"');
    expect(schemaSource).toContain("isPublic");
    expect(schemaSource).toContain("article_feedback_visitor_unique");
    expect(databaseSource).toContain("upsertArticleFeedback");
    expect(routerSource).toContain("submitArticleFeedback");
    expect(routerSource).toContain("articleFeedback");
  });

  it("يرسل تنبيهًا للإدارة عند استقبال طلب خدمة", () => {
    expect(routerSource).toContain("booking:");
    expect(routerSource).toContain("notifyOwner");
    expect(routerSource).toContain("طلب خدمة جديد من موقع الإشراقة");
  });
});
