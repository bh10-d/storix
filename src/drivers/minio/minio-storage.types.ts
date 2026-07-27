export interface MinIOStorageOptions {
    endPoint: string;
    port?: number;
    useSSL?: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region?: string;
}