import { Injectable } from '@nestjs/common';
import { RedirectsRepository } from '../repositories/redirects.repository';
import { RedirectsMapper } from '../mappers/redirects.mapper';
import { PublicRedirectResponseDto } from '../dto/redirect-response.dto';
import { normalizeSourcePath } from '../validators/redirect-path.util';

/**
 * Public read path — the only thing `apps/web`'s content resolver needs:
 * "is there an active redirect for this exact path?" Returns `null`
 * rather than throwing on a miss (the overwhelming common case — most
 * paths have no redirect), matching `PublicMenusService`'s "a 404 is a
 * legitimate site state" precedent rather than every other Public*Service
 * here (which throw because a missing slug usually IS an error).
 */
@Injectable()
export class PublicRedirectsService {
  constructor(
    private readonly repository: RedirectsRepository,
    private readonly mapper: RedirectsMapper
  ) {}

  async lookup(path: string): Promise<PublicRedirectResponseDto | null> {
    let normalized: string;
    try {
      normalized = normalizeSourcePath(path);
    } catch {
      return null;
    }

    const site = await this.repository.getDefaultSite();
    const redirect = await this.repository.findActiveBySourcePath(normalized, site.id);
    return redirect ? this.mapper.toPublicResponseDto(redirect) : null;
  }
}
