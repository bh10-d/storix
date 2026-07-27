# Local Filesystem Driver

The Local Storage Driver stores objects on the local filesystem.

```ts
import { LocalStorageDriver } from "storix";
```

## Configuration

```ts
new LocalStorageDriver({
    root: "./storage",
});
```

The `root` directory is the storage boundary.

For example:

```text
storage/
├── images/
│   └── avatar.png
└── documents/
    └── invoice.pdf
```

Logical keys:

```text
images/avatar.png
documents/invoice.pdf
```

---

## Upload

```ts
await storage.put({
    key: "images/avatar.png",
    content: Buffer.from("image"),
    contentType: "image/png",
});
```

Parent directories are created automatically when required.

---

## Read

```ts
const stream = await storage.get("images/avatar.png");
```

The returned value is a Node.js `Readable`.

---

## Delete

```ts
await storage.delete("images/avatar.png");
```

Deletion should be treated as idempotent for a missing object.

---

## Path Traversal Protection

Object keys must not escape the configured root directory.

Invalid:

```text
../../outside.txt
../../../etc/passwd
```

The driver must reject traversal attempts with an `INVALID_OBJECT_KEY` error.

This protection is important because object keys eventually become filesystem paths.

---

## Listing

```ts
const objects = await storage.list({
    prefix: "images/",
});
```

The driver recursively scans the storage root and returns object metadata.

Directories named `.storix` are ignored as internal storage metadata directories.

---

## Error Handling

Filesystem errors are normalized into `StorageError`.

Examples:

- Missing object
- Invalid object key
- Permission denied
- Unexpected filesystem failure

The driver should preserve security-related errors such as invalid path traversal instead of converting them into generic errors.

---

## Recommended Tests

The Local driver should test:

- Buffer upload
- Stream upload
- Missing stream size
- Get existing object
- Get missing object
- Delete existing object
- Delete missing object
- Path traversal rejection
- Exists for existing object
- Exists for missing object
- Metadata
- Prefix listing
- Nested directories
- Permission failures where practical
