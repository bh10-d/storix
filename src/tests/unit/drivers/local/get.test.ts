import { beforeEach, describe, expect, it } from "vitest";
import { Readable } from "node:stream";


import { createLocalStorage } from '../../../helpers/create-local-storage.js';

describe("LocalStorageDriver.get()", () => {
    let storage: Awaited<
        ReturnType<typeof createLocalStorage>
    >;

    beforeEach(async () => {
        storage = await createLocalStorage();
    });
    it("should return the stored object as a readable stream", async () => {
        const { storage } =
            await createLocalStorage();

        const key = "products/iphone.jpg";
        const content = Buffer.from(
            "fake image content",
        );

        await storage.put({
            key,
            content,
        });

        const stream = await storage.get(key);

        expect(stream).toBeInstanceOf(Readable);

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }

        expect(Buffer.concat(chunks)).toEqual(content);
    });

    it("should return a readable stream", async () => {
        await storage.storage.put({
            key: "hello.txt",
            content: Buffer.from("hello"),
        });

        const stream = await storage.storage.get(
            "hello.txt",
        );

        expect(stream).toBeInstanceOf(
            Readable,
        );
    });

    it("should return the correct content", async () => {
        await storage.storage.put({
            key: "hello.txt",
            content: Buffer.from("hello"),
        });

        const stream = await storage.storage.get(
            "hello.txt",
        );

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(
                Buffer.isBuffer(chunk)
                    ? chunk
                    : Buffer.from(chunk),
            );
        }

        expect(
            Buffer.concat(chunks).toString(),
        ).toBe("hello");
    });

    it("should reject path traversal attempts", async () => {
        await expect(
            storage.storage.get(
                "../../outside.txt",
            ),
        ).rejects.toMatchObject({
            name: "StorageError",
            code: "INVALID_OBJECT_KEY",
        });
    });
});