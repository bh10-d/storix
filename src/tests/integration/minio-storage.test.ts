import { describe, expect, it } from "vitest";

import {
    Readable,
} from "node:stream";

import {
    MinIOStorageDriver,
} from "../../drivers/minio/minio-storage-driver.js";

import {
    Storage,
} from "../../core/storage.js";

const storage = new Storage(
    new MinIOStorageDriver({
        endPoint: "localhost",
        port: 9000,
        useSSL: false,
        accessKey: "admin",
        secretKey: "admin123",
        bucket: "storix-minio",
    }),
);

describe("MinIOStorageDriver", () => {
    it("should upload an object", async () => {
    const result = await storage.put({
        key: "tests/iphone.jpg",
        content: Buffer.from("image content"),
        contentType: "image/jpeg",
    });

    expect(result).toMatchObject({
        key: "tests/iphone.jpg",
        size: 13,
        contentType: "image/jpeg",
    });
});

    it("should upload a Readable stream", async () => {
    const content = Buffer.from("stream content");

    const result = await storage.put({
        key: "tests/stream.txt",
        content: Readable.from(content),
        size: content.length,
        contentType: "text/plain",
    });

    expect(result).toMatchObject({
        key: "tests/stream.txt",
        size: content.length,
        contentType: "text/plain",
    });
});

    it("should reject a Readable stream without size", async () => {
        const content = Readable.from(
            Buffer.from("stream content"),
        );

        await expect(
            storage.put({
                key: "tests/invalid.txt",
                content,
                contentType: "text/plain",
            }),
        ).rejects.toThrow(
            "Size is required when uploading a Readable stream",
        );
    });

    it("should get an uploaded object", async () => {
        const content = Buffer.from(
            "content to retrieve",
        );

        await storage.put({
            key: "tests/get.txt",
            content,
            contentType: "text/plain",
        });

        const stream = await storage.get(
            "tests/get.txt",
        );

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(
                Buffer.isBuffer(chunk)
                    ? chunk
                    : Buffer.from(chunk),
            );
        }

        const result = Buffer.concat(chunks);

        expect(result.equals(content)).toBe(true);
    });

    it("should return true when an object exists", async () => {
        await storage.put({
            key: "tests/exists.txt",
            content: Buffer.from("exists"),
            contentType: "text/plain",
        });

        const result = await storage.exists(
            "tests/exists.txt",
        );

        expect(result).toBe(true);
    });

    it("should return false when an object does not exist", async () => {
        const result = await storage.exists(
            "tests/not-found.txt",
        );

        expect(result).toBe(false);
    });

    it("should delete an object", async () => {
        const key = "tests/delete.txt";

        await storage.put({
            key,
            content: Buffer.from("delete me"),
            contentType: "text/plain",
        });

        expect(
            await storage.exists(key),
        ).toBe(true);

        await storage.delete(key);

        expect(
            await storage.exists(key),
        ).toBe(false);
    });

    it("should return object metadata", async () => {
        const key = "tests/metadata.txt";

        const content = Buffer.from(
            "metadata content",
        );

        await storage.put({
            key,
            content,
            contentType: "text/plain",
        });

        const result = await storage.metadata(key);

        expect(result.key).toBe(key);
        expect(result.size).toBe(content.length);
        expect(result.contentType).toBe(
            "text/plain",
        );
        expect(result.lastModified).toBeInstanceOf(
            Date,
        );
    });

    it("should list objects", async () => {
        await storage.put({
            key: "tests/list/one.txt",
            content: Buffer.from("one"),
            contentType: "text/plain",
        });

        await storage.put({
            key: "tests/list/two.txt",
            content: Buffer.from("two"),
            contentType: "text/plain",
        });

        const result = await storage.list({
            prefix: "tests/list/",
        });

        const keys = result.map(
            (object) => object.key,
        );

        expect(keys).toContain(
            "tests/list/one.txt",
        );

        expect(keys).toContain(
            "tests/list/two.txt",
        );
    });
});