import { describe, expect, it } from "vitest";

import { Storage } from "../core/storage.js";
import { createStorage } from "../create-storage.js";
import type { StorageDriver } from "../core/storage-driver.js";

describe("createStorage()", () => {
    it("should wrap the provided driver", () => {
        const driver = {
            put: async () => ({
                key: "test.txt",
                size: 4,
            }),
            get: async () => {
                throw new Error("Not implemented");
            },
            delete: async () => {},
            exists: async () => true,
            metadata: async () => ({
                key: "test.txt",
                size: 4,
                lastModified: new Date(),
            }),
            list: async () => [],
        } satisfies StorageDriver;

        const storage = createStorage({
            driver,
        });

        expect(storage).toBeInstanceOf(Storage);
    });
});