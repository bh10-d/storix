import { describe, expect, it } from "vitest";

import { createLocalStorage } from '../../../helpers/create-local-storage.js';

describe("LocalStorageDriver.metadata()", () => {
    it("should return metadata for an existing object", async () => {
        const { storage } =
            await createLocalStorage();

        const key = "products/iphone.jpg";
        const content = Buffer.from("image");

        await storage.put({
            key,
            content,
        });

        const metadata =
            await storage.metadata(key);

        expect(metadata).toMatchObject({
            key,
            size: content.length,
        });

        expect(
            metadata.lastModified,
        ).toBeInstanceOf(Date);
    });

    it("should throw OBJECT_NOT_FOUND for a missing object", async () => {
        const { storage } =
            await createLocalStorage();

        await expect(
            storage.metadata(
                "products/not-found.jpg",
            ),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "OBJECT_NOT_FOUND",
        });
    });

    it("should reject path traversal attempts", async () => {
        const { storage } =
            await createLocalStorage();

        await expect(
            storage.metadata("../../outside.txt"),
        ).rejects.toThrow(
            "Storage key escapes the configured root directory",
        );
    });

    it("should throw StorageError when object does not exist", async () => {
        const { storage } =
            await createLocalStorage();
        
        await expect(
            storage.metadata(
                "missing/file.txt",
            ),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "OBJECT_NOT_FOUND",
        });
    });
});