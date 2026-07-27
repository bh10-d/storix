# API Reference

## `Storage`

The `Storage` class is the main application-facing API.

```ts
import { Storage } from "storix";
```

### Constructor

```ts
new Storage(driver: StorageDriver)
```

Example:

```ts
const storage = new Storage(
    new LocalStorageDriver({
        root: "./storage",
    }),
);
```

---

## `put`

Uploads an object.

```ts
storage.put(input: PutObjectInput): Promise<StoredObject>
```

### Input

```ts
interface PutObjectInput {
    key: string;
    content: Buffer | Readable;
    contentType?: string;
    size?: number;
}
```

### Buffer upload

```ts
const result = await storage.put({
    key: "documents/example.txt",
    content: Buffer.from("Hello Storix"),
    contentType: "text/plain",
});
```

### Stream upload

When using a `Readable` stream, the driver may require an explicit `size`.

```ts
const result = await storage.put({
    key: "videos/video.mp4",
    content: stream,
    size: fileSize,
    contentType: "video/mp4",
});
```

### Return value

```ts
interface StoredObject {
    key: string;
    size: number;
    contentType?: string;
    lastModified: Date;
}
```

---

## `get`

Retrieves an object as a Node.js `Readable`.

```ts
storage.get(key: string): Promise<Readable>
```

Example:

```ts
const stream = await storage.get("documents/example.txt");

for await (const chunk of stream) {
    console.log(chunk);
}
```

---

## `delete`

Deletes an object.

```ts
storage.delete(key: string): Promise<void>
```

Example:

```ts
await storage.delete("documents/example.txt");
```

A driver may define deletion of a missing object as idempotent.

---

## `exists`

Checks whether an object exists.

```ts
storage.exists(key: string): Promise<boolean>
```

Example:

```ts
const exists = await storage.exists("images/avatar.png");
```

Expected behavior:

- Existing object → `true`
- Missing object → `false`
- Unexpected backend failure → throws `StorageError`

---

## `metadata`

Returns object metadata.

```ts
storage.metadata(key: string): Promise<ObjectMetadata>
```

```ts
interface ObjectMetadata {
    key: string;
    size: number;
    contentType?: string;
    lastModified: Date;
}
```

Example:

```ts
const metadata = await storage.metadata("images/avatar.png");

console.log(metadata.size);
console.log(metadata.contentType);
console.log(metadata.lastModified);
```

---

## `list`

Lists objects.

```ts
storage.list(
    options?: ListObjectsOptions,
): Promise<ObjectMetadata[]>
```

```ts
interface ListObjectsOptions {
    prefix?: string;
}
```

Example:

```ts
const objects = await storage.list({
    prefix: "images/",
});
```

---

## `StorageDriver`

Custom drivers must implement:

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

---

## `createStorage`

```ts
createStorage(options: {
    driver: StorageDriver;
}): Storage
```

Example:

```ts
const storage = createStorage({
    driver: new LocalStorageDriver({
        root: "./storage",
    }),
});
```
