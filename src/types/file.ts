import type { Readable } from "node:stream";

export interface PutObjectInput {
    key: string;
    content: Buffer | Readable;
    contentType?: string;
    size?: number;
}

export interface ObjectInfo {
    key: string;
    size: number;
}

export interface StoredObject extends ObjectInfo {
    contentType?: string;
}

export interface ObjectMetadata extends ObjectInfo {
    contentType?: string;
    lastModified?: Date;
}

export interface ListObjectsOptions {
    prefix?: string;
}