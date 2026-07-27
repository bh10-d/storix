import { describe, expect, it } from "vitest";

import { createLocalStorage } from '../../../helpers/create-local-storage.js';

describe("LocalStorageDriver.list()", () => {
    it("should list all stored objects", async () => {
        const { storage } =
            await createLocalStorage();

        await storage.put({
            key: "products/iphone.jpg",
            content: Buffer.from("iphone"),
        });

        await storage.put({
            key: "products/ipad.jpg",
            content: Buffer.from("ipad"),
        });

        const objects = await storage.list();

        expect(
            objects.map((object) => object.key),
        ).toEqual(
            expect.arrayContaining([
                "products/iphone.jpg",
                "products/ipad.jpg",
            ]),
        );

        expect(objects).toHaveLength(2);
    });

    it("should list nested objects recursively", async () => {
        const { storage } =
            await createLocalStorage();

        await storage.put({
            key:
                "products/2026/iphone.jpg",
            content: Buffer.from("iphone"),
        });

        const objects = await storage.list();

        expect(objects).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    key:
                        "products/2026/iphone.jpg",
                }),
            ]),
        );
    });

    it("should filter objects by prefix", async () => {
        const { storage } =
            await createLocalStorage();

        await storage.put({
            key: "products/iphone.jpg",
            content: Buffer.from("iphone"),
        });

        await storage.put({
            key: "avatars/user-1.jpg",
            content: Buffer.from("avatar"),
        });

        const objects = await storage.list({
            prefix: "products/",
        });

        expect(objects).toHaveLength(1);

        expect(objects[0]).toMatchObject({
            key: "products/iphone.jpg",
        });
    });
});