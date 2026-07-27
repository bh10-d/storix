import { describe, expect, it } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { Storage } from "../../core/storage.js";
import { LocalStorageDriver } from "../../../src/drivers/local/local-storage-driver.js";

describe("Local Storage Integration", () => {
    it("should complete a full object lifecycle", async () => {
        const root = await mkdtemp(
            path.join(tmpdir(), "storix-"),
        );

        const storage = new Storage(
            new LocalStorageDriver({
                root,
            }),
        );

        const key =
            "products/iphone.jpg";

        const content = Buffer.from(
            "fake image content",
        );

        // PUT
        const storedObject =
            await storage.put({
                key,
                content,
                contentType: "image/jpeg",
            });

        expect(storedObject).toMatchObject({
            key,
            size: content.length,
            contentType: "image/jpeg",
        });

        // EXISTS
        await expect(
            storage.exists(key),
        ).resolves.toBe(true);

        // METADATA
        const metadata =
            await storage.metadata(key);

        expect(metadata).toMatchObject({
            key,
            size: content.length,
        });

        expect(
            metadata.lastModified,
        ).toBeInstanceOf(Date);

        // GET
        const stream =
            await storage.get(key);

        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }

        expect(
            Buffer.concat(chunks),
        ).toEqual(content);

        // LIST
        const objects =
            await storage.list({
                prefix: "products/",
            });

        expect(objects).toHaveLength(1);

        expect(objects[0]).toMatchObject({
            key,
            size: content.length,
        });

        // DELETE
        await storage.delete(key);

        // VERIFY DELETE
        await expect(
            storage.exists(key),
        ).resolves.toBe(false);
    });
});