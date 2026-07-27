import {
    describe,
    expect,
    it,
} from "vitest";

import {
    StorageError,
} from "../../../errors/storage-error.js";

describe("StorageError", () => {
    it("should create a storage error", () => {
        const error = new StorageError(
            "OBJECT_NOT_FOUND",
            "Object not found",
        );

        expect(error).toBeInstanceOf(
            Error,
        );

        expect(error).toBeInstanceOf(
            StorageError,
        );

        expect(error.name).toBe(
            "StorageError",
        );

        expect(error.code).toBe(
            "OBJECT_NOT_FOUND",
        );

        expect(error.message).toBe(
            "Object not found",
        );
    });

    it("should preserve the original cause", () => {
        const cause = new Error(
            "Original error",
        );

        const error = new StorageError(
            "UNKNOWN",
            "Storage failed",
            {
                cause,
            },
        );

        expect(error.cause).toBe(cause);
    });
});