# Testing

Storix uses Vitest for testing.

## Commands

```bash
npm run test
```

Watch mode:

```bash
npm run test
```

Run all tests once:

```bash
npm run test:run
```

Type checking:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Run one test file:

```bash
npm run test:run -- src/tests/unit/drivers/local/delete.test.ts
```

---

## Unit Tests

Unit tests should test a driver in isolation.

Example:

```text
src/tests/unit/
└── drivers/
    └── local/
        ├── put.test.ts
        ├── get.test.ts
        ├── delete.test.ts
        ├── exists.test.ts
        ├── metadata.test.ts
        └── list.test.ts
```

Recommended Local driver cases:

### Put

- Buffer upload
- Stream upload
- Missing stream size
- Nested key
- Content type

### Get

- Existing object
- Missing object
- Invalid object key

### Delete

- Existing object
- Missing object
- Path traversal

### Exists

- Existing object
- Missing object
- Unexpected filesystem failure

### Metadata

- Existing object
- Missing object
- Path traversal

### List

- Empty storage
- Multiple objects
- Nested directories
- Prefix filtering
- Internal directory exclusion

---

## Integration Tests

Integration tests use a real backend.

MinIO integration tests:

```text
src/tests/integration/
└── minio-storage.test.ts
```

They should test the complete path:

```text
Storage
  ↓
MinIOStorageDriver
  ↓
MinIO Client
  ↓
MinIO Server
```

---

## Test Isolation

Tests should use unique keys or clean up objects after execution.

Example:

```ts
const key = `tests/${crypto.randomUUID()}.txt`;
```

For local storage, use a temporary directory.

For MinIO, either:

- use unique test prefixes;
- delete test objects;
- use a dedicated test bucket.

---

## Assertions

Prefer behavior-based assertions:

```ts
expect(result.key).toBe(key);
expect(result.size).toBe(content.length);
```

For dynamic values:

```ts
expect(result.lastModified).toBeInstanceOf(Date);
```

Avoid deep equality when the result contains dynamic fields unless those fields are explicitly included in the expected object.

---

## Error Tests

Test both:

1. Error message
2. Error code

Example:

```ts
await expect(
    storage.metadata("../../outside.txt"),
).rejects.toMatchObject({
    name: "StorageError",
    code: "INVALID_OBJECT_KEY",
});
```

---

## Test Philosophy

The tests should verify:

- Correct behavior
- Consistent API
- Security boundaries
- Error classification
- Backend compatibility
