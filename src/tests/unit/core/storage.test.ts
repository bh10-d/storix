import { describe, expect, it, vi } from "vitest";

import { Storage } from "../../../core/storage.js";
import type { StorageDriver } from "../../../core/storage-driver.js";

describe("Storage", () => {
    it("should delegate put to the driver", async () => {
        const driver: StorageDriver = {
            put: vi.fn().mockResolvedValue({
                key: "test.txt",
                size: 4,
            }),
            get: vi.fn(),
            delete: vi.fn(),
            exists: vi.fn(),
            metadata: vi.fn(),
            list: vi.fn(),
        };

        const storage = new Storage(driver);

        const input = {
            key: "test.txt",
            content: Buffer.from("test"),
        };

        const result = await storage.put(input);

        expect(driver.put).toHaveBeenCalledWith(input);
        expect(result).toEqual({
            key: "test.txt",
            size: 4,
        });
    });

    it("should delegate get to the driver", async () => {
        const driver: StorageDriver = {
            put: vi.fn(),
            get: vi.fn().mockResolvedValue(
                "stream",
            ),
            delete: vi.fn(),
            exists: vi.fn(),
            metadata: vi.fn(),
            list: vi.fn(),
        };

        const storage = new Storage(driver);

        const result = await storage.get(
            "test.txt",
        );

        expect(driver.get).toHaveBeenCalledWith(
            "test.txt",
        );

        expect(result).toBe("stream");
    });

    it("should delegate delete to the driver", async () => {
        const driver: StorageDriver = {
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn().mockResolvedValue(
                undefined,
            ),
            exists: vi.fn(),
            metadata: vi.fn(),
            list: vi.fn(),
        };

        const storage = new Storage(driver);

        await storage.delete("test.txt");

        expect(
            driver.delete,
        ).toHaveBeenCalledWith("test.txt");
    });

    it("should delegate exists to the driver", async () => {
        const driver: StorageDriver = {
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
            exists: vi.fn().mockResolvedValue(true),
            metadata: vi.fn(),
            list: vi.fn(),
        };

        const storage = new Storage(driver);

        const result = await storage.exists(
            "test.txt",
        );

        expect(
            driver.exists,
        ).toHaveBeenCalledWith("test.txt");

        expect(result).toBe(true);
    });

    it("should delegate metadata to the driver", async () => {
        const driver: StorageDriver = {
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
            exists: vi.fn(),
            metadata: vi.fn().mockResolvedValue({
                key: "test.txt",
                size: 4,
                lastModified: new Date(),
            }),
            list: vi.fn(),
        };

        const storage = new Storage(driver);

        const result = await storage.metadata(
            "test.txt",
        );

        expect(
            driver.metadata,
        ).toHaveBeenCalledWith("test.txt");

        expect(result.key).toBe(
            "test.txt",
        );
    });

    it("should delegate list to the driver", async () => {
        const driver: StorageDriver = {
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
            exists: vi.fn(),
            metadata: vi.fn(),
            list: vi.fn().mockResolvedValue([]),
        };

        const storage = new Storage(driver);

        const result = await storage.list({
            prefix: "images/",
        });

        expect(
            driver.list,
        ).toHaveBeenCalledWith({
            prefix: "images/",
        });

        expect(result).toEqual([]);
    });
});