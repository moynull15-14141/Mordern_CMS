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

export interface PresignedUploadOptions {
  contentType?: string;
  expiresInSeconds?: number;
}

export interface PresignedUploadResult {
  url: string;
  expiresAt: Date;
}

export interface MultipartInitOptions {
  contentType?: string;
}

export interface MultipartInitResult {
  uploadId: string;
}

export interface MultipartPartUrl {
  partNumber: number;
  url: string;
}

export interface MultipartCompletedPart {
  partNumber: number;
  etag: string;
}

export interface HeadObjectResult {
  exists: boolean;
  contentType?: string;
  contentLength?: number;
}

/**
 * The frozen V1 default is Cloudflare R2 (S3-compatible, per
 * docs/20_BACKEND_ARCHITECTURE.md), but the contract stays provider-agnostic
 * so Local/MinIO/Azure/GCS can be added later without touching consumers.
 *
 * Milestone 5 (Enterprise Digital Asset Platform) added the presigned/
 * multipart/getObjectBuffer/headObject methods below for the real
 * presigned-direct-to-R2 upload pipeline; `upload`/`delete`/`getSignedUrl`
 * predate this milestone and are unchanged. Only `R2StorageProvider`
 * (`infrastructure/storage/r2-storage.provider.ts`) has a real
 * implementation — see `infrastructure/storage/storage.module.ts` for how
 * every other `StorageProviderType` still resolves to a
 * `NotImplementedStorageProvider` stub (DI resolves cleanly; individual
 * method calls throw).
 */
export interface StorageProvider extends Provider {
  upload(
    file: Buffer | NodeJS.ReadableStream,
    options: StorageUploadOptions
  ): Promise<StorageObject>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /** A short-lived signed PUT URL the browser uploads directly to — the backend never receives file bytes for a normal (non-multipart) upload. */
  createPresignedUploadUrl(
    key: string,
    options?: PresignedUploadOptions
  ): Promise<PresignedUploadResult>;
  /** Starts an S3-multipart upload for large files — chunk reassembly is handled entirely by R2/S3, no custom logic needed here. */
  initiateMultipartUpload(
    key: string,
    options?: MultipartInitOptions
  ): Promise<MultipartInitResult>;
  /** One short-lived signed PUT URL per part number, so the browser can upload each chunk directly. */
  getMultipartPartUrls(
    key: string,
    uploadId: string,
    partNumbers: number[]
  ): Promise<MultipartPartUrl[]>;
  completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: MultipartCompletedPart[]
  ): Promise<void>;
  abortMultipartUpload(key: string, uploadId: string): Promise<void>;
  /** Server-side download of the full object — used by the async media processor, never on a request path. */
  getObjectBuffer(key: string): Promise<Buffer>;
  /** Confirms an object actually landed after a presigned PUT, before enqueueing processing. */
  headObject(key: string): Promise<HeadObjectResult>;
}
