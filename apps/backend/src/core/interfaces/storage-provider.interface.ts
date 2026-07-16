import { Provider } from './provider.interface';

export enum StorageProviderType {
  LOCAL = 'local',
  S3 = 's3',
  R2 = 'r2',
  MINIO = 'minio',
  AZURE_BLOB = 'azure_blob',
  GCS = 'gcs',
}

export interface StorageUploadOptions {
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageObject {
  key: string;
  url: string;
}

/**
 * Interface only. The frozen V1 default is Cloudflare R2 (S3-compatible,
 * per docs/20_BACKEND_ARCHITECTURE.md), but the contract stays
 * provider-agnostic so Local/MinIO/Azure/GCS can be added later without
 * touching consumers. No implementation exists yet.
 */
export interface StorageProvider extends Provider {
  upload(file: Buffer | NodeJS.ReadableStream, options: StorageUploadOptions): Promise<StorageObject>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
