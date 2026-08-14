import { describe, expect, it } from "vitest";
import { makeReactionId, nextReaction } from "../shared/interactionHelpers";

describe("comment reactions", () => {
  it("builds a stable single-reaction key for a visitor and comment", () => {
    expect(makeReactionId(42, "a0b3c069-2e80-4e07-8743-7675d909002a")).toBe("42:a0b3c069-2e80-4e07-8743-7675d909002a");
  });
  it("removes a reaction when the same reaction is selected again", () => {
    expect(nextReaction("heart", "heart")).toBeNull();
    expect(nextReaction("broken", "heart")).toBe("heart");
  });
});
