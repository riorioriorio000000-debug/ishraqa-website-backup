import { afterEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { createApp } from "../../../server/index";

let server: Server | undefined;

afterEach(async () => {
  if (!server) return;
  server.close();
  await once(server, "close");
  server = undefined;
});

describe("مسار فحص صحة الإنتاج", () => {
  it("يعيد استجابة tRPC متوافقة مع فحص النشر", async () => {
    server = createServer(createApp());
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("منفذ الاختبار غير متاح");

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/trpc/system.health?input=${encodeURIComponent('{"json":{"timestamp":123}}')}`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      result: { data: { json: { status: "ok", timestamp: 123 } } },
    });
  });
});
