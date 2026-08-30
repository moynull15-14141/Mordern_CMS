import { Injectable } from '@nestjs/common';
import { Redirect } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { RedirectsRepository } from '../repositories/redirects.repository';
import { RedirectsMapper } from '../mappers/redirects.mapper';
import { RedirectQueryOptions } from '../interfaces/redirect-query.interface';
import { MAX_REDIRECT_CHAIN_LENGTH, DEFAULT_REDIRECT_TYPE } from '../constants/redirect.constants';
import {
  isInternalPath,
  isValidDestination,
  normalizeSourcePath,
} from '../validators/redirect-path.util';
import { CreateRedirectDto } from '../dto/create-redirect.dto';
import { UpdateRedirectDto } from '../dto/update-redirect.dto';
import { RedirectResponseDto } from '../dto/redirect-response.dto';
import {
  InvalidRedirectPathException,
  RedirectAlreadyDeletedException,
  RedirectLoopException,
  RedirectNotDeletedException,
  RedirectNotFoundException,
  RedirectSourceConflictException,
  SelfRedirectException,
} from '../exceptions/redirect.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Full CRUD for `Redirect` — no schema change, the model already existed
 * (Step 2 URL/SEO milestone's Phase 0 audit). No dedicated `redirect.*`
 * permission exists (frozen vocabulary) — every endpoint reuses
 * `page.manage`, the closest existing content/site-management permission,
 * same reasoning `TagsController` gives for reusing `category.create`.
 */
@Injectable()
export class RedirectsService {
  constructor(
    private readonly repository: RedirectsRepository,
    private readonly mapper: RedirectsMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getRedirectOrThrow(id: string, includeDeleted = false): Promise<Redirect> {
    const redirect = await this.repository.findById(id, includeDeleted);
    if (!redirect) {
      throw new RedirectNotFoundException(id);
    }
    return redirect;
  }

  private normalizeOrThrow(sourcePath: string): string {
    try {
      return normalizeSourcePath(sourcePath);
    } catch {
      throw new InvalidRedirectPathException('sourcePath', sourcePath);
    }
  }

  private assertValidDestination(destinationUrl: string): void {
    if (!isValidDestination(destinationUrl)) {
      throw new InvalidRedirectPathException('destinationUrl', destinationUrl);
    }
  }

  private async assertSourceAvailable(
    sourcePath: string,
    siteId: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repository.findBySourcePath(sourcePath, siteId, excludeId);
    if (existing) {
      throw new RedirectSourceConflictException(sourcePath);
    }
  }

  /**
   * Walks the redirect chain starting from `destinationUrl` (only when
   * it's an internal path — an external URL always ends the chain) up to
   * `MAX_REDIRECT_CHAIN_LENGTH` hops, using one bulk fetch of every active
   * redirect for the site rather than N sequential lookups. Rejects if
   * `sourcePath` (the redirect being created/edited) reappears anywhere in
   * that chain — a real cycle, not just an immediate self-redirect (that
   * narrower case is checked separately, before this ever runs).
   */
  private async assertNoLoop(
    sourcePath: string,
    destinationUrl: string,
    siteId: string,
    excludeId?: string
  ): Promise<void> {
    if (!isInternalPath(destinationUrl)) return;

    const all = await this.repository.findAllActive(siteId);
    const bySource = new Map(all.filter((r) => r.id !== excludeId).map((r) => [r.sourcePath, r]));

    let current: string = destinationUrl;
    for (let hop = 0; hop < MAX_REDIRECT_CHAIN_LENGTH; hop++) {
      if (current === sourcePath) {
        throw new RedirectLoopException(sourcePath);
      }
      const next = bySource.get(current);
      if (!next || !isInternalPath(next.destinationUrl)) return;
      current = next.destinationUrl;
    }
  }

  async createRedirect(dto: CreateRedirectDto, actor: ActingUser): Promise<RedirectResponseDto> {
    const site = await this.repository.getDefaultSite();
    const sourcePath = this.normalizeOrThrow(dto.sourcePath);
    this.assertValidDestination(dto.destinationUrl);
    if (sourcePath === dto.destinationUrl) {
      throw new SelfRedirectException(sourcePath);
    }
    await this.assertSourceAvailable(sourcePath, site.id);
    await this.assertNoLoop(sourcePath, dto.destinationUrl, site.id);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      sourcePath,
      destinationUrl: dto.destinationUrl,
      redirectType: dto.redirectType ?? DEFAULT_REDIRECT_TYPE,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'redirect.create',
      resource: 'redirect',
      resourceId: created.id,
      result: 'success',
    });
    return this.mapper.toResponseDto(created);
  }

  async getRedirect(id: string): Promise<RedirectResponseDto> {
    const redirect = await this.getRedirectOrThrow(id);
    return this.mapper.toResponseDto(redirect);
  }

  async listRedirects(
    options: RedirectQueryOptions
  ): Promise<PaginatedResult<RedirectResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updateRedirect(
    id: string,
    dto: UpdateRedirectDto,
    actor: ActingUser
  ): Promise<RedirectResponseDto> {
    const existing = await this.getRedirectOrThrow(id);

    const sourcePath =
      dto.sourcePath !== undefined ? this.normalizeOrThrow(dto.sourcePath) : existing.sourcePath;
    const destinationUrl = dto.destinationUrl ?? existing.destinationUrl;
    this.assertValidDestination(destinationUrl);
    if (sourcePath === destinationUrl) {
      throw new SelfRedirectException(sourcePath);
    }
    if (sourcePath !== existing.sourcePath) {
      await this.assertSourceAvailable(sourcePath, existing.siteId, id);
    }
    await this.assertNoLoop(sourcePath, destinationUrl, existing.siteId, id);

    const updated = await this.repository.update(id, {
      sourcePath,
      destinationUrl,
      redirectType: dto.redirectType,
      status: dto.status,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'redirect.update',
      resource: 'redirect',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }

  async deleteRedirect(id: string, actor: ActingUser): Promise<RedirectResponseDto> {
    const existing = await this.getRedirectOrThrow(id);
    if (existing.deletedAt) {
      throw new RedirectAlreadyDeletedException(id);
    }

    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'redirect.delete',
      resource: 'redirect',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getRedirectOrThrow(id, true));
  }

  async restoreRedirect(id: string, actor: ActingUser): Promise<RedirectResponseDto> {
    const existing = await this.getRedirectOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new RedirectNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'redirect.restore',
      resource: 'redirect',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getRedirectOrThrow(id));
  }
}
