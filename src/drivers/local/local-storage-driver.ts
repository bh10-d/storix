import { createWriteStream, createReadStream  } from "node:fs";
import { access, mkdir, stat, writeFile, unlink, readdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

import { StorageDriver } from "../../core/storage-driver.js";
import type { ListObjectsOptions, ObjectMetadata, PutObjectInput, StoredObject } from "../../types/file.js";
import { LocalStorageDriverOptions } from "./local-storage.types.js";
import { StorageError } from "../../errors/storage-error.js";
import { normalizeStorageError } from "../../errors/normalize-storage-error.js";

export class LocalStorageDriver implements StorageDriver {
    private readonly root: string;

    private mapError(error: unknown, key: string): StorageError {
        if (error instanceof Error && "code" in error) {
            switch (error.code) {
                case "ENOENT":
                    return new StorageError("OBJECT_NOT_FOUND", `Object not found: ${key}`, { cause: error });
                    case "EACCES":
                    case "EPERM":
                        return new StorageError("PERMISSION_DENIED", `Permission denied: ${key}`, { cause: error });
            }
        }
        return new StorageError("STORAGE_ERROR", `Storage operation failed: ${key}`, { cause: error });
    }

    constructor(options: LocalStorageDriverOptions) {
        this.root = path.resolve(options.root);
    }

    async put(input: PutObjectInput): Promise<StoredObject> {
        try {
            const filePath = this.resolvePath(input.key);

            await mkdir(path.dirname(filePath), { recursive: true });

            await writeFile(filePath, input.content);

            const stats = await stat(filePath);

            return {
                key: input.key,
                size: stats.size,
                contentType: input.contentType,
            };
        } catch (error) {
            throw normalizeStorageError(error, `Failed to put object: ${input.key}`);
        }
    }

    async get(key: string): Promise<Readable> {
        let filePath: string;
        try{
            filePath = this.resolvePath(key);
        } catch (error) {
            throw normalizeStorageError(error, `Failed to get object: ${key}`);
        }
        return createReadStream(filePath);
    }

    async delete(key: string): Promise<void> {
        try {
            await unlink(this.resolvePath(key));
        } catch (error) {
            if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                return;
            }
            throw normalizeStorageError(error, `Failed to delete object: ${key}`);
        }
    }

    async exists(key: string): Promise<boolean> {
        let filePath: string;

        try {
            filePath = this.resolvePath(key);
        } catch (error) {
            throw normalizeStorageError(error, `Failed to check existence of object: ${key}`);
        }

        try {
            await access(filePath);
            return true;
        } catch (error) {
            if(error instanceof Error && "code" in error && error.code === "ENOENT") {
                return false;
            }
            throw normalizeStorageError(error, `Failed to check existence of object: ${key}`);
        }
    }

    async metadata(key: string): Promise<ObjectMetadata> {
        try {
            const stats = await stat(this.resolvePath(key));
            return {
                key,
                size: stats.size,
                lastModified: stats.mtime,
            };
            
        } catch (error) {
            throw normalizeStorageError(
                error,
                `Failed to read metadata for object: ${key}`,
            );
        }

    }

    async list(options?: ListObjectsOptions): Promise<ObjectMetadata[]> {
        const prefix = options?.prefix ?? "";

        const objects: ObjectMetadata[] = [];

        try {
            await this.walkDirectory(this.root, prefix, objects);
            return objects;
        } catch (error) {
            throw normalizeStorageError(error, "Failed to list objects")
        }
    }

    private resolvePath(key: string): string {
        const resolvedPath = path.resolve(this.root, key);

        const relativePath = path.relative(this.root, resolvedPath);

        if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
            throw new StorageError("INVALID_OBJECT_KEY", "Storage key escapes the configured root directory");
        }

        return resolvedPath;
    }

    private async walkDirectory(directory: string, prefix: string, objects: ObjectMetadata[]): Promise<void> {
        const entries = await readdir(directory, { withFileTypes: true, });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === ".storix") {
                    continue;
                }

                await this.walkDirectory(fullPath, prefix, objects);
                continue;
            }
            const relativePath = path.relative(this.root, fullPath);

            const key = relativePath.split(path.sep).join("/");

            if (!key.startsWith(prefix)) {
                continue;
            }

            const fileStats = await stat(fullPath);

            objects.push({
                key,
                size: fileStats.size,
                lastModified: fileStats.mtime,
            });
        }
    }
}