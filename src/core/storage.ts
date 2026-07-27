import { Readable } from "node:stream";

import type { PutObjectInput, ObjectMetadata, StoredObject, ListObjectsOptions } from "../types/file.js";

import type { StorageDriver } from "./storage-driver.js";

export class Storage {
    constructor(private readonly driver: StorageDriver) {}

    put(input: PutObjectInput): Promise<StoredObject> {
        return this.driver.put(input);
    }

    get(key: string): Promise<Readable> {
        return this.driver.get(key);
    }

    delete(key: string): Promise<void> {
        return this.driver.delete(key);
    }

    exists(key: string): Promise<boolean> {
        return this.driver.exists(key);
    }

    metadata(key: string): Promise<ObjectMetadata> {
        return this.driver.metadata(key);
    }

    list(options?: ListObjectsOptions): Promise<ObjectMetadata[]> {
        return this.driver.list(options);
    }
}