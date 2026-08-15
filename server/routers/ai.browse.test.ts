import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const mocks = vi.hoisted(() => ({
  fetchPublicPageText: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("../webPage", () => ({ fetchPublicPageText: mocks.fetchPublicPageText }));
vi.mock("../_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));

import { appRouter } from "../routers";

beforeEach(() => {
  vi.clearAllMocks();
});

function createPublicContext(identity: string): TrpcContext {
  return {
    user: null,
    req: { ip: identity, protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ai.browseAndSummarize", () => {
  it("يلخص صفحة عامة بعد قراءتها من طبقة التصفح الآمنة", async () => {
    mocks.fetchPublicPageText.mockResolvedValueOnce({
      title: "صفحة عامة",
      text: "نص عام قصير وآمن للقراءة.",
      url: "https://example.com/guide",
    });
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: "هذا ملخص الصفحة." } }] });

    const caller = appRouter.createCaller(createPublicContext("198.51.100.101"));
    await expect(caller.ai.browseAndSummarize({ url: "https://example.com/guide", question: "لخصها" })).resolves.toEqual({
      summary: "هذا ملخص الصفحة.",
      title: "صفحة عامة",
      sourceUrl: "https://example.com/guide",
    });
    expect(mocks.fetchPublicPageText).toHaveBeenCalledWith("https://example.com/guide");
    expect(mocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({ maxTokens: 600 }));
  });

  it("يعرض سببًا آمنًا عند رفض عنوان محلي ولا يرسل محتواه إلى المساعد", async () => {
    mocks.fetchPublicPageText.mockRejectedValueOnce(new Error("لا يمكن فتح عنوان محلي."));
    const caller = appRouter.createCaller(createPublicContext("198.51.100.102"));

    await expect(caller.ai.browseAndSummarize({ url: "https://example.com/blocked" })).rejects.toThrow("لا يمكن فتح عنوان محلي.");
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });

  it("يستبدل أخطاء الاتصال الداخلية برسالة عربية آمنة", async () => {
    mocks.fetchPublicPageText.mockRejectedValueOnce(new Error("ECONNRESET"));
    const caller = appRouter.createCaller(createPublicContext("198.51.100.103"));

    await expect(caller.ai.browseAndSummarize({ url: "https://example.com/unavailable" })).rejects.toThrow("تعذر تلخيص الصفحة الآن. تأكد أن الرابط عام ويشير إلى صفحة HTML ثم حاول مجددًا.");
  });
});
