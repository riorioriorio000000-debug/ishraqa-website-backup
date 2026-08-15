import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const mocks = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
  storagePut: vi.fn(),
  storageGetSignedUrl: vi.fn(),
}));

vi.mock("../_core/llm", () => ({ invokeLLM: mocks.invokeLLM }));
vi.mock("../storage", () => ({
  storagePut: mocks.storagePut,
  storageGetSignedUrl: mocks.storageGetSignedUrl,
}));

import { appRouter } from "../routers";

function createPublicContext(identity: string): TrpcContext {
  return {
    user: null,
    req: { ip: identity, protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ai.chat attachments", () => {
  it("يرفع الصورة المسموح بها ويرسل رابطها الموقّع للمساعد دون وضع البيانات الخام في الرد", async () => {
    mocks.storagePut.mockResolvedValueOnce({ key: "assistant-attachments/photo_a1b2.png", url: "/manus-storage/assistant-attachments/photo_a1b2.png" });
    mocks.storageGetSignedUrl.mockResolvedValueOnce("https://storage.example.test/signed-photo");
    mocks.invokeLLM.mockResolvedValueOnce({ choices: [{ message: { content: "الصورة تبدو مرتبطة بأدوات تنظيف منزلية." } }] });
    const caller = appRouter.createCaller(createPublicContext("198.51.100.121"));

    const response = await caller.ai.chat({
      messages: [{ role: "user", content: "اشرح هذه الصورة" }],
      attachment: {
        name: "photo.png",
        mimeType: "image/png",
        dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
      },
      pageContext: { title: "خدمة العملاء الذكية", url: "/customer-service" },
    });

    expect(response.reply).toBe("الصورة تبدو مرتبطة بأدوات تنظيف منزلية.");
    expect(response.workSummary).toContain("راجعت المرفق المسموح الذي أرسلته مع السؤال.");
    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringMatching(/^assistant-attachments\//), expect.any(Buffer), "image/png");
    expect(mocks.storageGetSignedUrl).toHaveBeenCalledWith("assistant-attachments/photo_a1b2.png");
    expect(mocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: "user",
          content: [
            { type: "text", text: "اشرح هذه الصورة" },
            { type: "image_url", image_url: { url: "https://storage.example.test/signed-photo", detail: "auto" } },
          ],
        }),
      ]),
    }));
  });

  it("يرفض نوع الملف غير المسموح قبل رفعه أو إرساله للمساعد", async () => {
    const caller = appRouter.createCaller(createPublicContext("198.51.100.122"));

    await expect(caller.ai.chat({
      messages: [{ role: "user", content: "اقرأ الملف" }],
      attachment: {
        name: "script.exe",
        mimeType: "application/x-msdownload" as never,
        dataUrl: "data:application/x-msdownload;base64,aGVsbG8gd29ybGQ=",
      },
    })).rejects.toThrow();

    expect(mocks.storagePut).not.toHaveBeenCalled();
    expect(mocks.invokeLLM).not.toHaveBeenCalled();
  });
});
