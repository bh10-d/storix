# Error Handling

Storix normalizes backend-specific failures into `StorageError`.

## `StorageError`

```ts
class StorageError extends Error {
    code: string;
}
```

Example:

```ts
try {
    await storage.get("missing.txt");
} catch (error) {
    if (error instanceof StorageError) {
        console.log(error.code);
    }
}
```

## Why Normalize Errors?

Different backends expose different errors:

- Node.js filesystem errors
- MinIO errors
- S3 SDK errors
- Custom backend errors

Application code should not need to understand every backend's error model.

---

## Error Normalization

Drivers should wrap backend operations:

```ts
try {
    await backendOperation();
} catch (error) {
    throw normalizeStorageError(
        error,
        "Failed to perform storage operation",
    );
}
```

---

## Important Validation Errors

Validation should happen before backend operations whenever possible.

Example:

```ts
const size = Buffer.isBuffer(input.content)
    ? input.content.length
    : input.size;

if (size === undefined) {
    throw new Error(
        "Size is required when uploading a Readable stream",
    );
}
```

Do not wrap a validation error into a generic backend error if callers need to identify the actual validation problem.

A better pattern is:

```ts
const size = Buffer.isBuffer(input.content)
    ? input.content.length
    : input.size;

if (size === undefined) {
    throw new StorageError(
        "Size is required when uploading a Readable stream",
        "INVALID_INPUT",
    );
}

try {
    await backendOperation();
} catch (error) {
    throw normalizeStorageError(error);
}
```

---

## Error Codes

Recommended codes:

| Code | Meaning |
|---|---|
| `INVALID_INPUT` | Invalid method input |
| `INVALID_OBJECT_KEY` | Invalid or unsafe object key |
| `OBJECT_NOT_FOUND` | Object does not exist |
| `BUCKET_NOT_FOUND` | Configured bucket does not exist |
| `PERMISSION_DENIED` | Access denied |
| `STORAGE_UNAVAILABLE` | Backend unavailable |
| `UNKNOWN` | Unclassified failure |

---

## Error Handling Rules

### 1. Preserve Storix Errors

If an operation already throws a `StorageError`, do not wrap it again.

```ts
try {
    // operation
} catch (error) {
    if (error instanceof StorageError) {
        throw error;
    }

    throw normalizeStorageError(error);
}
```

### 2. Preserve Security Errors

Path traversal must remain:

```text
INVALID_OBJECT_KEY
```

It must not become:

```text
UNKNOWN
```

### 3. `exists` Is Special

`exists()` should return `false` for a missing object.

It should not hide unexpected failures:

```ts
try {
    await statObject();
    return true;
} catch (error) {
    if (isNotFoundError(error)) {
        return false;
    }

    throw normalizeStorageError(error);
}
```

### 4. Delete Semantics

Deletion of a missing object should generally be idempotent.

```ts
await storage.delete("already-deleted.txt");
```

should normally resolve successfully.

---

## Error Boundary

The recommended architecture is:

```text
Application
    │
    ▼
Storage API
    │
    ▼
Driver
    │
    ▼
Backend SDK / Filesystem
    │
    ▼
Backend Error
    │
    ▼
normalizeStorageError()
    │
    ▼
StorageError
```
