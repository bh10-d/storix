export type StorageErrorCode = 
| 'OBJECT_NOT_FOUND'
| 'OBJECT_ALREADY_EXISTS'
| 'STORAGE_UNAVAILABLE'
| 'PERMISSION_DENIED'
| 'INVALID_OBJECT_KEY'
| 'INVALID_INPUT'
| 'UNKNOWN'
| 'STORAGE_ERROR'

export class StorageError extends Error {
    readonly code: StorageErrorCode;
    readonly cause?: unknown;

    constructor(code: StorageErrorCode, message: string, options?: { cause?: unknown;}) {
        super(message);

        this.name = 'StorageError';
        this.code = code;
        this.cause = options?.cause;
    }
}