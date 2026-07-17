import { Injectable } from '@nestjs/common';
import { Prisma, Setting } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { SettingScopeContext } from '../enums/setting-scope.enum';

/**
 * Persistence access to the existing, frozen `Setting` table
 * (`36_DATABASE_FREEZE.md`) — no schema change, no migration. Every write
 * goes through find-then-upsert by composite key rather than a blind
 * insert: Postgres unique indexes treat NULL as distinct, so the partial
 * unique index on `(site_id, namespace, key)` does not by itself prevent
 * duplicate rows when `site_id IS NULL` (Global scope) — this repository is
 * what actually enforces global-scope uniqueness (see
 * docs/39_SETTINGS_ARCHITECTURE.md "Known Gaps").
 */
@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private scopeWhere(scope: SettingScopeContext): Prisma.SettingWhereInput {
    return {
      siteId: scope.siteId ?? null,
      tenantId: scope.tenantId ?? null,
      deletedAt: null,
    };
  }

  async findAll(scope: SettingScopeContext): Promise<Setting[]> {
    return this.prisma.setting.findMany({ where: this.scopeWhere(scope) });
  }

  async findByCategory(category: string, scope: SettingScopeContext): Promise<Setting[]> {
    return this.prisma.setting.findMany({
      where: { ...this.scopeWhere(scope), namespace: category },
    });
  }

  async findOne(
    category: string,
    key: string,
    scope: SettingScopeContext
  ): Promise<Setting | null> {
    return this.prisma.setting.findFirst({
      where: { ...this.scopeWhere(scope), namespace: category, key },
    });
  }

  async upsert(
    category: string,
    key: string,
    value: Prisma.InputJsonValue,
    scope: SettingScopeContext,
    actorId: string | null
  ): Promise<Setting> {
    const existing = await this.findOne(category, key, scope);
    if (existing) {
      return this.prisma.setting.update({
        where: { id: existing.id },
        data: { value, updatedBy: actorId },
      });
    }
    return this.prisma.setting.create({
      data: {
        namespace: category,
        key,
        value,
        siteId: scope.siteId ?? null,
        tenantId: scope.tenantId ?? null,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }

  /** Reset = remove the override row so resolution falls back to the
   * env/default tiers. Soft-deletes to stay consistent with every other
   * table's soft-delete convention (`36_DATABASE_FREEZE.md`). */
  async deleteOverride(
    category: string,
    key: string,
    scope: SettingScopeContext,
    actorId: string | null
  ): Promise<void> {
    const existing = await this.findOne(category, key, scope);
    if (!existing) {
      return;
    }
    await this.prisma.setting.update({
      where: { id: existing.id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async deleteCategoryOverrides(
    category: string,
    scope: SettingScopeContext,
    actorId: string | null
  ): Promise<void> {
    await this.prisma.setting.updateMany({
      where: { ...this.scopeWhere(scope), namespace: category },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async deleteAllOverrides(scope: SettingScopeContext, actorId: string | null): Promise<void> {
    await this.prisma.setting.updateMany({
      where: this.scopeWhere(scope),
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }
}
