import { beforeEach, describe, expect, it } from "vitest";

import { createLocalStorage } from '../../../helpers/create-local-storage.js';

describe("LocalStorageDriver.delete()", () => {
    let storage: Awaited<
        ReturnType<typeof createLocalStorage>
    >;

    beforeEach(async () => {
        storage = await createLocalStorage();
    });
    it("should delete an existing object", async () => {
        const { storage } =
            await createLocalStorage();

        const key = "products/iphone.jpg";

        await storage.put({
            key,
            content: Buffer.from("image"),
        });

        await storage.delete(key);

        await expect(
            storage.exists(key),
        ).resolves.toBe(false);
    });

    it("should be idempotent for a missing object", async () => {
        await expect(
            storage.storage.delete(
                "products/not-found.jpg",
            ),
        ).resolves.toBeUndefined();
    });

    it("should reject path traversal attempts", async () => {
        const { storage } =
            await createLocalStorage();

        await expect(
            storage.delete("../../outside.txt"),
        ).rejects.toThrow(
            "Storage key escapes the configured root directory",
        );
    });

    it("should reject path traversal attempts", async () => {
        const { storage } =
            await createLocalStorage();
        await expect(
            storage.delete(
                "../../outside.txt",
            ),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "INVALID_OBJECT_KEY",
        });
    });
});