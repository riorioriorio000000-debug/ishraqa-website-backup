import { afterEach, describe, expect, it, vi } from "vitest";

const externalVariables = [
  "STORAGE_DRIVER",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_FORCE_PATH_STYLE",
] as const;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("external storage selection", () => {
  it("keeps the platform storage driver when no external driver is requested", async () => {
    vi.stubEnv("STORAGE_DRIVER", "forge");
    externalVariables.filter(key => key !== "STORAGE_DRIVER").forEach(key => vi.stubEnv(key, ""));
    const { getStorageDriver, storagePublicPath } = await import("./storage");

    expect(getStorageDriver()).toBe("forge");
    expect(storagePublicPath("avatars/test.png")).toBe("/manus-storage/avatars/test.png");
  });

  it("rejects incomplete S3 configuration instead of silently falling back to platform storage", async () => {
    vi.stubEnv("STORAGE_DRIVER", "s3");
    vi.stubEnv("S3_BUCKET", "ishraqa-media");
    const { getStorageDriver } = await import("./storage");

    expect(() => getStorageDriver()).toThrow(/S3 storage config missing/i);
  });

  it("accepts a complete S3 configuration for the external compatibility route", async () => {
    vi.stubEnv("STORAGE_DRIVER", "s3");
    vi.stubEnv("S3_ENDPOINT", "https://example.r2.cloudflarestorage.com");
    vi.stubEnv("S3_REGION", "auto");
    vi.stubEnv("S3_BUCKET", "ishraqa-media");
    vi.stubEnv("S3_ACCESS_KEY_ID", "test-access-key");
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "test-secret-key");
    const { getStorageDriver, storagePublicPath } = await import("./storage");

    expect(getStorageDriver()).toBe("s3");
    expect(storagePublicPath("article image.png")).toBe("/manus-storage/article%20image.png");
  });
});
