import { describe, expect, it } from "vitest";

import {
    Storage,
    LocalStorageDriver,
} from "../dist/index.js";

describe("Package Smoke Test", () => {
    it("should expose the public API", () => {
        expect(Storage).toBeDefined();
        expect(LocalStorageDriver).toBeDefined();
    });
});