import * as Minio from "minio";

import type { StorageDriver } from "../../core/storage-driver.js";
import type { MinIOStorageOptions } from "./minio-storage.types.js";
import { ListObjectsOptions, ObjectMetadata, PutObjectInput, StoredObject } from "../../types/file.js";
import { normalizeStorageError } from "../../errors/normalize-storage-error.js";
import type { Readable } from "node:stream";

export class MinIOStorageDriver implements StorageDriver {
    private readonly client: Minio.Client;

    private readonly bucket: string;

    constructor(options: MinIOStorageOptions) {
        this.client = new Minio.Client({
            endPoint: options.endPoint,
            port: options.port ?? 9000,
            useSSL: options.useSSL ?? false,
            accessKey: options.accessKey,
            secretKey: options.secretKey,
            region: options.region,
        });
        this.bucket = options.bucket;
    }

    private async ensureBucket(): Promise<void> {
        const exists = await this.client.bucketExists(this.bucket);
        if (!exists) {
            await this.client.makeBucket(this.bucket,);
        }
    }

    private isNotFoundError(error: unknown): boolean {
        if (typeof error !== "object" || error === null) {
            return false;
        }

        const code = (error as { code?: string }).code;

        return (code === "NotFound" || code === "NoSuchKey" || code === "NoFoundError");
    }

    async put(input: PutObjectInput): Promise<StoredObject> {
        // await this.ensureBucket();

        // const metadata: Minio.ItemBucketMetadata = {};

        // if (input.contentType) {
        //     metadata["Content-Type"] = input.contentType;
        // }

        // const size = Buffer.isBuffer(input.content) ? input.content.length : input.size;

        // if (size === undefined) {
        //     throw new Error(
        //         "Size is required when uploading a Readable stream",
        //     );
        // }

        // await this.client.putObject(this.bucket, input.key, input.content, size, metadata);

        // return {
        //     key: input.key,
        //     size: size,
        //     contentType: input.contentType,
        // }
        const size = Buffer.isBuffer(input.content) ? input.content.length : input.size;

        if (size === undefined) {
            throw new Error("Size is required when uploading a Readable stream");
        }
        try {
            await this.ensureBucket();

            const metadata: Minio.ItemBucketMetadata = {};

            if (input.contentType) {
                metadata["Content-Type"] = input.contentType;
            }

            await this.client.putObject(this.bucket, input.key, input.content, size, metadata);

            return {
                key: input.key,
                size: size,
                contentType: input.contentType,
                // lastModified: new Date(),
            };
        } catch (error) {
            throw normalizeStorageError(error, `Failed to put object: ${input.key}`);
        }
    }

    async get(key: string): Promise<Readable> {
        // return this.client.getObject(this.bucket, key,);
        try {
            return await this.client.getObject(this.bucket, key);
        } catch (error) {
            throw normalizeStorageError(error, `Failed to get object: ${key}`);
        }
    }

    async delete(key: string): Promise<void> {
        // await this.client.removeObject(this.bucket, key);
        try {
            await this.client.removeObject(this.bucket, key);
        } catch (error) {
            throw normalizeStorageError(error, `Failed to delete object: ${key}`);
        }
    }

    async exists(key: string): Promise<boolean> {
        // try {
        //     await this.client.statObject(this.bucket, key,);
        //     return true;
        // } catch {
        //     return false;
        // }
        try {
            await this.client.statObject(this.bucket, key);
            return true;
        } catch (error) {
            if (this.isNotFoundError(error)) {
                return false;
            }

            throw normalizeStorageError(error, `Failed to check object existence: ${key}`);
        }
    }

    async metadata(key: string): Promise<ObjectMetadata> {
        // const stat = await this.client.statObject(this.bucket, key,);

        // return {
        //     key,
        //     size: stat.size,
        //     contentType: stat.metaData["content-type"] as string | undefined,
        //     lastModified: stat.lastModified,
        // }
        try {
            const stat = await this.client.statObject(this.bucket, key);

            return {
                key,
                size: stat.size,
                contentType: stat.metaData["content-type"] as string | undefined,
                lastModified: stat.lastModified,
            };
        } catch (error) {
            throw normalizeStorageError(error, `Failed to read metadata for object: ${key}`);
        }
    }

    async list(options?: ListObjectsOptions): Promise<ObjectMetadata[]> {
        //     const objects: ObjectMetadata[] = [];

        //     const stream = this.client.listObjects(this.bucket, options?.prefix, true,);

        //     for await (const object of stream) {
        //         objects.push({
        //             key: object.name,
        //             size: object.size,
        //             lastModified: object.lastModified,
        //         });
        //     }

        //     return objects;
        // }

        try {
            const objects: ObjectMetadata[] = [];

            const stream = this.client.listObjects(this.bucket, options?.prefix, true);

            for await (const object of stream) {
                objects.push({
                    key: object.name,
                    size: object.size,
                    lastModified: object.lastModified,
                });
            }

            return objects;
        } catch (error) {
            throw normalizeStorageError(error, `Failed to list objects`);
        }
    }
}