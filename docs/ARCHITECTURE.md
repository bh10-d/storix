# Storix Architecture

## Design Goal

Storix separates the storage API from the storage backend
implementation.

The application should depend on the abstraction rather than a specific
storage provider.

------------------------------------------------------------------------

## High-Level Architecture

``` text
Application
    │
    ▼
┌──────────────┐
│   Storage    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ StorageDriver│
└──────┬───────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│ Local Driver │ │ MinIO Driver │
└──────┬───────┘ └──────┬───────┘
       │                │
       ▼                ▼
 Filesystem          MinIO
```

------------------------------------------------------------------------

## Storage

`Storage` is the high-level API exposed to the application.

Its responsibility is to provide a stable interface for storage
operations.

``` ts
const storage = new Storage(driver);
```

The `Storage` class should not contain provider-specific implementation
details.

------------------------------------------------------------------------

## StorageDriver

`StorageDriver` defines the contract that every storage backend must
implement.

``` ts
interface StorageDriver {
    put(...): Promise<...>;
    get(...): Promise<...>;
    exists(...): Promise<...>;
    delete(...): Promise<...>;
    metadata(...): Promise<...>;
    list(...): Promise<...>;
}
```

Any backend that implements this contract can be used by Storix.

------------------------------------------------------------------------

## Drivers

Drivers contain provider-specific implementation details.

Examples:

``` text
LocalStorageDriver
    ↓
Node.js Filesystem API
```

``` text
MinIOStorageDriver
    ↓
MinIO SDK
    ↓
MinIO Server
```

The driver is the only layer that should know how a specific backend
works.

------------------------------------------------------------------------

## Dependency Direction

The intended dependency direction is:

``` text
Application
    ↓
Storage
    ↓
StorageDriver
    ↓
Concrete Driver
    ↓
Storage Backend
```

Higher-level code should not directly depend on the concrete storage
backend.

------------------------------------------------------------------------

## Adding a New Driver

To add a new storage backend:

1.  Implement `StorageDriver`
2.  Add provider-specific configuration
3.  Implement each storage operation
4.  Add unit tests
5.  Add integration tests
6.  Expose the driver through the public API if necessary

Example:

``` ts
class MinIOStorageDriver implements StorageDriver {
    async put(...) {}
    async get(...) {}
    async exists(...) {}
    async delete(...) {}
    async metadata(...) {}
    async list(...) {}
}
```

The existing `Storage` API should not need to change.

------------------------------------------------------------------------

## Core Design Principle

> Storage backends should be replaceable without changing
> application-level storage logic.
