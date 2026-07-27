import { StorageError, type StorageErrorCode } from './storage-error.js';

export function normalizeStorageError(error: unknown, fallbackMessage: string): StorageError {
    if (error instanceof StorageError) {
        return error;
    }

    if (typeof error === "object" && error !== null && "code" in error) {
        const code = error.code;

        if (code === "ENOENT") {
            return new StorageError("OBJECT_NOT_FOUND", fallbackMessage, { cause: error });
        }

        if (code === "EACCES" || code === "EPERM") {
            return new StorageError("PERMISSION_DENIED", fallbackMessage, { cause: error });
        }
    }

    if (error instanceof Error) {
        return new StorageError("UNKNOWN", fallbackMessage, { cause: error });
    }

    return new StorageError("UNKNOWN", fallbackMessage);
}