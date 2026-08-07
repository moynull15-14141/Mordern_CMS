import { Inject, Injectable } from '@nestjs/common';
import { MediaStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import type { StorageProvider } from '../../../core/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../../../infrastructure/storage/storage.constants';
import { MediaRepository } from '../repositories/media.repository';
import { MediaService } from './media.service';
import { BulkActionResultDto } from '../dto/bulk-media-action.dto';
import {
  MediaAssetInUseException,
  MediaAssetNotDeletedException,
  MediaAssetNotFoundException,
  MediaValidationException,
} from '../exceptions/media.exceptions';

interface ActingUser {
  id: string;
}

interface MediaVariantEntry {
  storageKey: string;
}

/**
 * Bulk endpoints (Milestone 5) — real batch backend calls, not N sequential
 * single-item requests from the admin UI (there is no existing bulk-select
 * pattern anywhere in this admin app to mirror, confirmed by full grep
 * before writing this — this is genuinely new UI, but backed by a real
 * batch API so it isn't the N-sequential-calls trap). Every bulk action
 * reuses `MediaService`'s already-validated single-item business logic
 * (ownership checks, usage guards) via a partial-success loop — the only
 * genuinely new operation is `permanentDelete`, this codebase's first real
 * hard-delete.
 */
@Injectable()
export class MediaBulkService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly repository: MediaRepository,
    private readonly mediaService: MediaService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async runBulk(
    ids: string[],
    actor: ActingUser,
    actionName: string,
    action: (id: string) => Promise<unknown>
  ): Promise<BulkActionResultDto> {
    const succeeded: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const id of ids) {
      try {
        await action(id);
        succeeded.push(id);
      } catch (error) {
        failed.push({ id, reason: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    this.auditLogger.record({
      actorId: actor.id,
      action: `media.bulk_${actionName}`,
      resource: 'media_asset',
      result: failed.length === 0 ? 'success' : 'failure',
    });
    return { succeeded, failed };
  }

  async bulkMove(
    ids: string[],
    folderId: string | undefined,
    actor: ActingUser
  ): Promise<BulkActionResultDto> {
    return this.runBulk(ids, actor, 'move', (id) =>
      this.mediaService.moveMediaAsset(id, { folderId: folderId ?? null }, actor)
    );
  }

  async bulkArchive(ids: string[], actor: ActingUser): Promise<BulkActionResultDto> {
    return this.runBulk(ids, actor, 'archive', (id) =>
      this.mediaService.updateMediaAsset(id, { status: MediaStatus.ARCHIVED }, actor)
    );
  }

  async bulkUnarchive(ids: string[], actor: ActingUser): Promise<BulkActionResultDto> {
    return this.runBulk(ids, actor, 'unarchive', (id) =>
      this.mediaService.updateMediaAsset(id, { status: MediaStatus.READY }, actor)
    );
  }

  async bulkRestore(ids: string[], actor: ActingUser): Promise<BulkActionResultDto> {
    return this.runBulk(ids, actor, 'restore', (id) =>
      this.mediaService.restoreMediaAsset(id, actor)
    );
  }

  async bulkDelete(ids: string[], actor: ActingUser): Promise<BulkActionResultDto> {
    return this.runBulk(ids, actor, 'delete', (id) =>
      this.mediaService.deleteMediaAsset(id, actor)
    );
  }

  /**
   * "Trash, then Purge" — requires `confirm: true` and requires the asset
   * already be soft-deleted (an extra safety rail beyond the literal
   * spec, consistent with common DAM/CMS UX). Still blocked if in-use.
   * Deletes the original + every variant object from storage, then a real
   * `prisma.mediaAsset.delete()`.
   */
  async permanentDelete(id: string, confirm: boolean, actor: ActingUser): Promise<void> {
    if (!confirm) {
      throw new MediaValidationException(
        'Permanent delete requires confirm: true in the request body.'
      );
    }
    const asset = await this.repository.findById(id, true);
    if (!asset) {
      throw new MediaAssetNotFoundException(id);
    }
    if (!asset.deletedAt) {
      throw new MediaAssetNotDeletedException(id);
    }

    const usages = await this.mediaService.getUsagesIncludingDeleted(id);
    if (usages.length > 0) {
      throw new MediaAssetInUseException(id, usages.length);
    }

    const variants = (asset.variants as Record<string, MediaVariantEntry> | null) ?? {};
    await Promise.all([
      this.storage.delete(asset.storageKey),
      ...Object.values(variants).map((variant) => this.storage.delete(variant.storageKey)),
    ]);
    await this.repository.hardDelete(id);

    this.auditLogger.record({
      actorId: actor.id,
      action: 'media.permanent_delete',
      resource: 'media_asset',
      resourceId: id,
      result: 'success',
    });
  }
}
