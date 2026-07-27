# Storix

**Storix** is a pluggable TypeScript file storage abstraction library.

It provides a unified API for storing, retrieving, deleting, checking, inspecting, and listing objects across different storage backends.

The core design separates:

- **Storage API** — the public API consumed by applications.
- **StorageDriver** — the backend contract.
- **Drivers** — concrete implementations such as Local Filesystem and MinIO.
- **StorageError** — normalized error handling across backends.

## Features

- Unified storage API
- Pluggable storage drivers
- Local filesystem driver
- MinIO driver
- Custom driver support
- TypeScript-first API
- ESM support
- Normalized `StorageError`
- Path traversal protection for local storage
- Prefix-based object listing
- Buffer and `Readable` stream upload support
- Unit and integration testing support

## Installation

```bash
npm install storix
```

## Basic Usage

```ts
import { Storage, LocalStorageDriver } from "storix";

const storage = new Storage(
    new LocalStorageDriver({
        root: "./storage",
    }),
);

await storage.put({
    key: "images/avatar.png",
    content: Buffer.from("image content"),
    contentType: "image/png",
});

const stream = await storage.get("images/avatar.png");

const exists = await storage.exists("images/avatar.png");

const metadata = await storage.metadata("images/avatar.png");

const objects = await storage.list({
    prefix: "images/",
});

await storage.delete("images/avatar.png");
```

## Using `createStorage`

```ts
import {
    createStorage,
    LocalStorageDriver,
} from "storix";

const storage = createStorage({
    driver: new LocalStorageDriver({
        root: "./storage",
    }),
});
```

## Supported Drivers

| Driver | Status |
|---|---|
| Local Filesystem | Available |
| MinIO | Available |
| Amazon S3 | Planned |
| Custom Driver | Supported |

## API

Every storage backend implements the same `StorageDriver` contract:

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

## Object Model

An object is identified by a logical key:

```text
images/avatar.png
documents/invoices/2026/invoice-001.pdf
users/123/profile.json
```

Storix intentionally separates the logical object key from the physical storage implementation.

## Error Handling

Backend-specific errors are normalized into `StorageError`.

```ts
import { StorageError } from "storix";

try {
    await storage.get("missing.txt");
} catch (error) {
    if (error instanceof StorageError) {
        console.log(error.code);
    }
}
```

See [Error Handling](./docs/error-handling.md).

## Development

```bash
npm install
npm run build
npm run typecheck
npm run test:run
```

## Project Structure

```text
src/
├── core/
│   ├── storage.ts
│   └── storage-driver.ts
├── drivers/
│   ├── local/
│   │   └── local-storage-driver.ts
│   └── minio/
│       ├── minio-storage-driver.ts
│       └── minio-storage.types.ts
├── errors/
│   ├── normalize-storage-error.ts
│   └── storage-error.ts
├── types/
│   └── file.ts
├── create-storage.ts
└── index.ts
```

## Roadmap

- Amazon S3 driver
- Additional S3-compatible drivers
- Better metadata support
- Multipart upload support
- Streaming upload improvements
- Configurable retry policies
- Observability hooks
- More comprehensive error classification

See [Roadmap](./docs/roadmap.md).
