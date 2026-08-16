import { describe, expect, it } from "vitest";
import { shouldPlayReplyNotificationSound } from "./notificationSound";

describe("صوت إشعار الرد", () => {
  it("لا يصدر صوتًا عند معرفة أول رد قائم أو عندما يكون التفضيل متوقفًا", () => {
    expect(shouldPlayReplyNotificationSound(undefined, 5, true)).toBe(false);
    expect(shouldPlayReplyNotificationSound(5, 6, false)).toBe(false);
  });

  it("يصدر صوتًا لرد أحدث فقط عند تفعيل التفضيل", () => {
    expect(shouldPlayReplyNotificationSound(5, 6, true)).toBe(true);
    expect(shouldPlayReplyNotificationSound(6, 5, true)).toBe(false);
  });
});
