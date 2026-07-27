import { Storage } from "./core/storage.js";
import type { StorageDriver } from "./core/storage-driver.js";

export interface CreateStorageOptions {
    driver: StorageDriver;
}

export function createStorage(options: CreateStorageOptions): Storage {
    return new Storage(options.driver);
}