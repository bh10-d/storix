# Roadmap

## Current Version

Storix currently provides:

- Core Storage API
- `StorageDriver` abstraction
- Local Filesystem Driver
- MinIO Driver
- `StorageError`
- Error normalization
- Buffer upload
- Readable stream upload
- Object metadata
- Prefix-based listing
- TypeScript declarations
- ESM package support
- Unit tests
- MinIO integration tests

---

## Phase 1 — Core Abstraction

Status: Complete

- [x] Storage API
- [x] StorageDriver interface
- [x] Object types
- [x] Factory function
- [x] Public exports

---

## Phase 2 — Local Driver

Status: Complete

- [x] Put
- [x] Get
- [x] Delete
- [x] Exists
- [x] Metadata
- [x] List
- [x] Prefix filtering
- [x] Nested directories
- [x] Path traversal protection
- [x] Error normalization

---

## Phase 3 — MinIO Driver

Status: Complete

- [x] Bucket initialization
- [x] Put
- [x] Get
- [x] Delete
- [x] Exists
- [x] Metadata
- [x] List
- [x] Error normalization
- [x] Integration tests

---

## Phase 4 — Package Quality

Status: In Progress

- [x] Build
- [x] Type declarations
- [x] ESM package support
- [x] Local tarball installation
- [x] Basic usage example
- [ ] Better package metadata
- [ ] Automated release pipeline

---

## Phase 5 — AWS S3

Status: Planned

A dedicated AWS S3 driver is planned.

Possible implementation:

```ts
new S3StorageDriver({
    region: "...",
    bucket: "...",
    credentials: {
        accessKeyId: "...",
        secretAccessKey: "...",
    },
});
```

The S3 driver should remain separate from the MinIO driver even though both use S3-compatible APIs.

---

## Phase 6 — Advanced Features

Potential features:

- Multipart uploads
- Resumable uploads
- Streaming downloads
- Retry policies
- Timeout configuration
- Metadata support
- Custom HTTP headers
- Presigned URLs
- Object copy
- Object move
- Batch deletion
- Pagination
- Concurrency controls
- Metrics
- Logging hooks
- Tracing hooks

---

## Design Principle

Storix should remain:

```text
Simple Core
    +
Stable Driver Contract
    +
Backend-Specific Implementations
```

New features should not unnecessarily couple the core API to a particular backend.
