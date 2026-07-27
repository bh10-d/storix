import { beforeEach, describe, expect, it } from "vitest";

import { createLocalStorage } from '../../../helpers/create-local-storage.js';

describe("LocalStorageDriver.exists()", () => {
    let storage: Awaited<
        ReturnType<typeof createLocalStorage>
    >;

    beforeEach(async () => {
        storage = await createLocalStorage();
    });
    it("should return true for an existing object", async () => {
        const { storage } =
            await createLocalStorage();

        const key = "products/iphone.jpg";

        await storage.put({
            key,
            content: Buffer.from("image"),
        });

        await expect(
            storage.exists(key),
        ).resolves.toBe(true);
    });

    it("should return false for a missing object", async () => {
        const { storage } =
            await createLocalStorage();

        await expect(
            storage.exists(
                "products/not-found.jpg",
            ),
        ).resolves.toBe(false);
    });

    it("should reject path traversal attempts", async () => {
        const { storage } =
            await createLocalStorage();

        await expect(
            storage.exists("../../outside.txt"),
        ).rejects.toThrow(
            "Storage key escapes the configured root directory",
        );
    });

    it("should return true when object exists", async () => {
        await storage.storage.put({
            key: "exists.txt",
            content: Buffer.from("hello"),
        });

        await expect(
            storage.storage.exists("exists.txt"),
        ).resolves.toBe(true);
    });

    it("should return false when object does not exist", async () => {
        await expect(
            storage.storage.exists("missing.txt"),
        ).resolves.toBe(false);
    });

    it("should reject path traversal attempts", async () => {
        await expect(
            storage.storage.exists("../../outside.txt"),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "INVALID_OBJECT_KEY",
        });
    });


});