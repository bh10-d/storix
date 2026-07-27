# Custom Drivers

Storix is designed around the `StorageDriver` interface.

This allows applications to implement custom storage backends without changing application code.

## Driver Contract

```ts
interface StorageDriver {
    put(input: PutObjectInput): Promise<StoredObject>;

    get(key: string): Promise<Readable>;

    delete(key: string): Promise<void>;

    exists(key: string): Promise<boolean>;

    metadata(key: string): Promise<ObjectMetadata>;

    list(options?: ListObjectsOptions): Promise<ObjectMetadata[]>;
}
```

## Example Driver

```ts
import { Readable } from "node:stream";

import type {
    ListObjectsOptions,
    ObjectMetadata,
    PutObjectInput,
    StoredObject,
} from "storix";

import type { StorageDriver } from "storix";

class MemoryStorageDriver implements StorageDriver {
    private objects = new Map<
        string,
        {
            content: Buffer;
            contentType?: string;
            lastModified: Date;
        }
    >();

    async put(input: PutObjectInput): Promise<StoredObject> {
        const content = Buffer.isBuffer(input.content)
            ? input.content
            : await this.readStream(input.content);

        const lastModified = new Date();

        this.objects.set(input.key, {
            content,
            contentType: input.contentType,
            lastModified,
        });

        return {
            key: input.key,
            size: content.length,
            contentType: input.contentType,
            lastModified,
        };
    }

    async get(key: string): Promise<Readable> {
        const object = this.objects.get(key);

        if (!object) {
            throw new Error("Object not found");
        }

        return Readable.from(object.content);
    }

    async delete(key: string): Promise<void> {
        this.objects.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        return this.objects.has(key);
    }

    async metadata(key: string): Promise<ObjectMetadata> {
        const object = this.objects.get(key);

        if (!object) {
            throw new Error("Object not found");
        }

        return {
            key,
            size: object.content.length,
            contentType: object.contentType,
            lastModified: object.lastModified,
        };
    }

    async list(
        options?: ListObjectsOptions,
    ): Promise<ObjectMetadata[]> {
        const prefix = options?.prefix ?? "";

        return [...this.objects.entries()]
            .filter(([key]) => key.startsWith(prefix))
            .map(([key, object]) => ({
                key,
                size: object.content.length,
                contentType: object.contentType,
                lastModified: object.lastModified,
            }));
    }

    private async readStream(
        stream: Readable,
    ): Promise<Buffer> {
        const chunks: Buffer[] = [];

        for await (const chunk of stream) {
            chunks.push(
                Buffer.isBuffer(chunk)
                    ? chunk
                    : Buffer.from(chunk),
            );
        }

        return Buffer.concat(chunks);
    }
}
```

## Design Guidelines

A custom driver should:

1. Implement every `StorageDriver` method.
2. Return the common Storix data types.
3. Normalize backend-specific errors.
4. Keep backend-specific behavior inside the driver.
5. Avoid exposing backend SDK types through the public API.
6. Preserve consistent semantics for missing objects.
7. Support prefix-based listing where the backend supports it.

## Driver Selection

Application code should depend on `Storage`, not a concrete driver:

```ts
const storage = createStorage({
    driver,
});
```

This allows the backend to change without rewriting application logic.
