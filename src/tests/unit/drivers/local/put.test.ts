import { describe, it, expect, beforeEach } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { createLocalStorage } from '../../../helpers/create-local-storage.js';

describe("LocalStorageDriver.put()", () => {
    let storage: Awaited<
        ReturnType<typeof createLocalStorage>
    >;

    beforeEach(async () => {
        storage = await createLocalStorage();
    });
    it("should store a buffer successfully", async () => {
        const { root, storage } =
            await createLocalStorage();

        const key = "products/iphone.jpg";
        const content = Buffer.from(
            "fake image content",
        );

        const result = await storage.put({
            key,
            content,
            contentType: "image/jpeg",
        });

        expect(result).toEqual({
            key,
            size: content.length,
            contentType: "image/jpeg",
        });

        const filePath = path.join(
            root,
            "products",
            "iphone.jpg",
        );

        const storedContent =
            await readFile(filePath);

        expect(storedContent).toEqual(content);
    });

    it("should create nested directories automatically", async () => {
        const { root, storage } =
            await createLocalStorage();

        const key =
            "products/2026/07/iphone.jpg";

        const content = Buffer.from("image");

        await storage.put({
            key,
            content,
        });

        const filePath = path.join(
            root,
            "products",
            "2026",
            "07",
            "iphone.jpg",
        );

        const storedContent =
            await readFile(filePath);

        expect(storedContent).toEqual(content);
    });

    it("should overwrite an existing object", async () => {
        const { storage } =
            await createLocalStorage();

        const key = "products/iphone.jpg";

        await storage.put({
            key,
            content: Buffer.from("version 1"),
        });

        await storage.put({
            key,
            content: Buffer.from("version 2"),
        });

        const stream = await storage.get(key);

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }

        expect(
            Buffer.concat(chunks).toString(),
        ).toBe("version 2");
    });

    it("should reject path traversal attempts", async () => {
        await expect(
            storage.storage.put({
                key: "../../outside.txt",
                content: Buffer.from("malicious"),
            }),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "INVALID_OBJECT_KEY",
        });
    });

    it("should reject path traversal attempts", async () => {
        expect.assertions(1);

        try {
            await storage.storage.put({
                key: "../../outside.txt",
                content: Buffer.from("malicious"),
            });
        } catch (error) {
            expect(error).toMatchObject({
                code: "INVALID_OBJECT_KEY",
                message:
                    "Storage key escapes the configured root directory",
            });
        }
    });

    it("should reject path traversal attempts", async () => {
        await expect(
            storage.storage.put({
                key: "../../outside.txt",
                content: Buffer.from("malicious"),
            }),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "INVALID_OBJECT_KEY",
        });
    });

    it("should create nested directories automatically", async () => {
        const result = await storage.storage.put({
            key: "products/images/2026/photo.jpg",
            content: Buffer.from("image"),
        });

        expect(result.key).toBe(
            "products/images/2026/photo.jpg",
        );

        expect(
            await storage.storage.exists(
                "products/images/2026/photo.jpg",
            ),
        ).toBe(true);
    });
});