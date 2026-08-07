import { Injectable } from '@nestjs/common';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../../config/config.service';
import type {
  HeadObjectResult,
  MultipartCompletedPart,
  MultipartInitOptions,
  MultipartInitResult,
  MultipartPartUrl,
  PresignedUploadOptions,
  PresignedUploadResult,
  StorageObject,
  StorageProvider,
  StorageUploadOptions,
} from '../../core/interfaces/storage-provider.interface';

const DEFAULT_SIGNED_URL_TTL_SECONDS = 900;

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const name = 'name' in error ? String((error as { name?: unknown }).name) : '';
  const statusCode =
    '$metadata' in error
      ? (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
      : undefined;
  return name === 'NotFound' || statusCode === 404;
}

/**
 * Real Cloudflare R2 implementation of `StorageProvider` (Milestone 5) — R2
 * is S3-API-compatible, so this is a thin wrapper over `@aws-sdk/client-s3`
 * pointed at `STORAGE_ENDPOINT`/`STORAGE_REGION=auto` (R2's own convention).
 * The only concrete `StorageProvider` implementation in this codebase — see
 * `storage.module.ts` for how every other `StorageProviderType` still
 * resolves to a `NotImplementedStorageProvider` stub.
 */
@Injectable()
export class R2StorageProvider implements StorageProvider {
  readonly name = 'r2';

  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: AppConfigService) {
    const storage = config.storage;
    this.bucket = storage.bucket;
    this.client = new S3Client({
      region: storage.region || 'auto',
      endpoint: storage.endpoint,
      credentials: {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      },
    });
  }

  async upload(
    file: Buffer | NodeJS.ReadableStream,
    options: StorageUploadOptions
  ): Promise<StorageObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        // `PutObjectCommand`'s Body type comes from `@smithy/types`, a transitive dep we don't
        // depend on directly — a value-preserving cast avoids adding an explicit dependency
        // purely for a type import (the SDK accepts Buffer/Readable/Blob/string at runtime).
        Body: file as Buffer,
        ContentType: options.contentType,
        Metadata: options.metadata,
      })
    );
    return { key: options.key, url: await this.getSignedUrl(options.key) };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds: number = DEFAULT_SIGNED_URL_TTL_SECONDS
  ): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async createPresignedUploadUrl(
    key: string,
    options?: PresignedUploadOptions
  ): Promise<PresignedUploadResult> {
    const expiresInSeconds = options?.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS;
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: options?.contentType }),
      { expiresIn: expiresInSeconds }
    );
    return { url, expiresAt: new Date(Date.now() + expiresInSeconds * 1000) };
  }

  async initiateMultipartUpload(
    key: string,
    options?: MultipartInitOptions
  ): Promise<MultipartInitResult> {
    const result = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: options?.contentType,
      })
    );
    if (!result.UploadId) {
      throw new Error('R2 did not return an UploadId for the multipart upload.');
    }
    return { uploadId: result.UploadId };
  }

  async getMultipartPartUrls(
    key: string,
    uploadId: string,
    partNumbers: number[]
  ): Promise<MultipartPartUrl[]> {
    return Promise.all(
      partNumbers.map(async (partNumber) => ({
        partNumber,
        url: await getSignedUrl(
          this.client,
          new UploadPartCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
          }),
          { expiresIn: DEFAULT_SIGNED_URL_TTL_SECONDS }
        ),
      }))
    );
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: MultipartCompletedPart[]
  ): Promise<void> {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({ PartNumber: part.partNumber, ETag: part.etag })),
        },
      })
    );
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    await this.client.send(
      new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId })
    );
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) {
      throw new Error(`R2 object body is empty for key "${key}".`);
    }
    const chunks: Buffer[] = [];
    for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async headObject(key: string): Promise<HeadObjectResult> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key })
      );
      return { exists: true, contentType: result.ContentType, contentLength: result.ContentLength };
    } catch (error) {
      if (isNotFoundError(error)) {
        return { exists: false };
      }
      throw error;
    }
  }
}
