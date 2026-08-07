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

/**
 * Resolves DI cleanly for every `StorageProviderType` other than `r2`/`s3`
 * (`local`/`minio`/`azure_blob`/`gcs`) so `@Inject(STORAGE_PROVIDER)` never
 * throws at bootstrap — only calling a method throws, with a message naming
 * exactly which provider would need implementing.
 */
export class NotImplementedStorageProvider implements StorageProvider {
  readonly name: string;

  constructor(private readonly providerType: string) {
    this.name = providerType || 'unconfigured';
  }

  private fail(): never {
    throw new Error(
      `StorageProvider "${this.providerType}" is not implemented. Only "r2"/"s3" have a concrete implementation (Milestone 5) — set STORAGE_PROVIDER=r2.`
    );
  }

  upload(
    _file: Buffer | NodeJS.ReadableStream,
    _options: StorageUploadOptions
  ): Promise<StorageObject> {
    return this.fail();
  }

  delete(_key: string): Promise<void> {
    return this.fail();
  }

  getSignedUrl(_key: string, _expiresInSeconds?: number): Promise<string> {
    return this.fail();
  }

  createPresignedUploadUrl(
    _key: string,
    _options?: PresignedUploadOptions
  ): Promise<PresignedUploadResult> {
    return this.fail();
  }

  initiateMultipartUpload(
    _key: string,
    _options?: MultipartInitOptions
  ): Promise<MultipartInitResult> {
    return this.fail();
  }

  getMultipartPartUrls(
    _key: string,
    _uploadId: string,
    _partNumbers: number[]
  ): Promise<MultipartPartUrl[]> {
    return this.fail();
  }

  completeMultipartUpload(
    _key: string,
    _uploadId: string,
    _parts: MultipartCompletedPart[]
  ): Promise<void> {
    return this.fail();
  }

  abortMultipartUpload(_key: string, _uploadId: string): Promise<void> {
    return this.fail();
  }

  getObjectBuffer(_key: string): Promise<Buffer> {
    return this.fail();
  }

  headObject(_key: string): Promise<HeadObjectResult> {
    return this.fail();
  }
}
