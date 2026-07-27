# MinIO Driver

The MinIO driver provides object storage using the MinIO S3-compatible API.

```ts
import {
    MinIOStorageDriver,
} from "storix";
```

## Configuration

```ts
const driver = new MinIOStorageDriver({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: "admin",
    secretKey: "admin123",
    bucket: "storix",
});
```

## Options

```ts
interface MinIOStorageOptions {
    endPoint: string;
    port?: number;
    useSSL?: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region?: string;
}
```

---

## Bucket Initialization

The driver can ensure the configured bucket exists before uploading.

```ts
await storage.put({
    key: "images/avatar.png",
    content: Buffer.from("image"),
});
```

If the bucket does not exist, the driver creates it.

---

## Buffer Upload

```ts
await storage.put({
    key: "images/avatar.png",
    content: Buffer.from("image content"),
    contentType: "image/png",
});
```

---

## Stream Upload

Streams require a known size:

```ts
await storage.put({
    key: "videos/video.mp4",
    content: stream,
    size: videoSize,
});
```

Without a size:

```ts
await storage.put({
    key: "videos/video.mp4",
    content: stream,
});
```

The operation should fail with a validation error.

---

## Get

```ts
const stream = await storage.get("images/avatar.png");
```

The result is a `Readable` stream.

---

## Exists

The driver uses object metadata/stat operations to determine existence.

```ts
const exists = await storage.exists("images/avatar.png");
```

Expected behavior:

- Object exists → `true`
- Object not found → `false`
- Other MinIO/backend error → throws normalized `StorageError`

---

## Delete

```ts
await storage.delete("images/avatar.png");
```

Backend errors are normalized.

---

## Metadata

```ts
const metadata = await storage.metadata(
    "images/avatar.png",
);
```

Returns:

```ts
{
    key: "images/avatar.png",
    size: 1234,
    contentType: "image/png",
    lastModified: Date
}
```

---

## List

```ts
const objects = await storage.list({
    prefix: "images/",
});
```

The MinIO object stream is converted into the common Storix metadata format.

---

## Integration Testing

A local MinIO instance can be used for integration tests.

Example environment:

```text
Endpoint: localhost
Port: 9000
Access Key: admin
Secret Key: admin123
Bucket: storix-minio
```

Integration tests should cover:

- Buffer upload
- Stream upload
- Stream without size
- Get
- Exists
- Missing object
- Delete
- Metadata
- Prefix listing

---

## AWS S3 Compatibility

MinIO uses an S3-compatible API, but Storix should keep the MinIO driver separate from a future AWS S3 driver.

The planned S3 driver should have its own implementation and configuration model.

