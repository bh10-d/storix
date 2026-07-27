import type {
    ListObjectsOptions,
    ObjectMetadata,
    PutObjectInput,
    StoredObject,
} from "../types/file.js";

import type { Readable } from "node:stream";

export interface StorageDriver {
    put(input: PutObjectInput): Promise<StoredObject>;

    get(key: string): Promise<Readable>;

    delete(key: string): Promise<void>;

    exists(key: string): Promise<boolean>;

    metadata(key: string): Promise<ObjectMetadata>;

    list(options?: ListObjectsOptions): Promise<StoredObject[]>;
}