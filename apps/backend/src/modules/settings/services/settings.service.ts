import { Injectable } from '@nestjs/common';
import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';
import { GLOBAL_SCOPE, SettingScopeContext } from '../enums/setting-scope.enum';
import { SettingDefinition, buildSettingKey } from '../interfaces/setting-definition.interface';
import { SettingValue } from '../interfaces/setting-value.type';
import { getSettingDefinitions, SETTING_DEFINITION_MAP } from '../settings.constants';
import { SettingsRepository } from '../repositories/settings.repository';
import { SettingsValidator } from '../validators/settings.validator';
import { SettingsMapper } from '../mappers/settings.mapper';
import { SettingResponseDto, SettingValueSource } from '../dto/setting-response.dto';
import { SettingEntryDto } from '../dto/bulk-update-settings.dto';
import { ImportSettingEntryDto, ImportSettingsResultDto } from '../dto/import-settings.dto';
import { ExportSettingsDto } from '../dto/export-settings.dto';
import { SettingNotFoundException } from '../exceptions/settings.exceptions';

function parseEnvValue(type: SettingType, raw: string): SettingValue {
  switch (type) {
    case SettingType.BOOLEAN:
      return raw === 'true';
    case SettingType.NUMBER:
      return Number(raw);
    case SettingType.ARRAY:
      return raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    case SettingType.JSON:
      try {
        return JSON.parse(raw) as SettingValue;
      } catch {
        return raw;
      }
    default:
      return raw;
  }
}

/**
 * Orchestrates every setting read/write through the frozen priority chain
 * (docs/39_SETTINGS_ARCHITECTURE.md):
 *   Runtime Override -> Environment Variable -> Database Setting -> System Default
 * `SETTING_DEFINITIONS` is the closed vocabulary — an unrecognized key always
 * raises `SettingNotFoundException`, never silently falls through.
 */
@Injectable()
export class SettingsService {
  /** Process-lifetime only, never persisted — the "Runtime Override" tier.
   * No REST endpoint exposes this in Milestone 6; it exists so in-process
   * code (e.g. a future kill switch) can override a value for the life of
   * the process without a database write. */
  private readonly runtimeOverrides = new Map<string, SettingValue>();

  constructor(
    private readonly repository: SettingsRepository,
    private readonly validator: SettingsValidator,
    private readonly mapper: SettingsMapper
  ) {}

  setRuntimeOverride(settingKey: string, value: SettingValue): void {
    this.runtimeOverrides.set(settingKey, value);
  }

  clearRuntimeOverride(settingKey: string): void {
    this.runtimeOverrides.delete(settingKey);
  }

  private getDefinitionOrThrow(settingKey: string): SettingDefinition {
    const definition = SETTING_DEFINITION_MAP.get(settingKey);
    if (!definition) {
      throw new SettingNotFoundException(settingKey);
    }
    return definition;
  }

  /** Resolves a definition's value through the full priority chain, without
   * DTO wrapping/redaction — used internally (e.g. by FeatureFlagsService)
   * and as the building block for the public DTO-returning methods below. */
  async resolveValue(
    definition: SettingDefinition,
    scope: SettingScopeContext = GLOBAL_SCOPE
  ): Promise<{ value: SettingValue; source: SettingValueSource }> {
    const settingKey = buildSettingKey(definition.category, definition.key);

    if (this.runtimeOverrides.has(settingKey)) {
      return {
        value: this.runtimeOverrides.get(settingKey)!,
        source: SettingValueSource.RUNTIME_OVERRIDE,
      };
    }

    if (definition.envKey && process.env[definition.envKey] !== undefined) {
      return {
        value: parseEnvValue(definition.type, process.env[definition.envKey] as string),
        source: SettingValueSource.ENVIRONMENT,
      };
    }

    const row = await this.repository.findOne(definition.category, definition.key, scope);
    if (row) {
      return { value: row.value as SettingValue, source: SettingValueSource.DATABASE };
    }

    return { value: definition.defaultValue, source: SettingValueSource.DEFAULT };
  }

  async getAll(scope: SettingScopeContext = GLOBAL_SCOPE): Promise<SettingResponseDto[]> {
    return Promise.all(
      getSettingDefinitions().map(async (definition) => {
        const { value, source } = await this.resolveValue(definition, scope);
        return this.mapper.toResponseDto(definition, value, source);
      })
    );
  }

  async getByCategory(
    category: SettingCategory,
    scope: SettingScopeContext = GLOBAL_SCOPE
  ): Promise<SettingResponseDto[]> {
    return Promise.all(
      getSettingDefinitions(category).map(async (definition) => {
        const { value, source } = await this.resolveValue(definition, scope);
        return this.mapper.toResponseDto(definition, value, source);
      })
    );
  }

  async getByKey(
    settingKey: string,
    scope: SettingScopeContext = GLOBAL_SCOPE
  ): Promise<SettingResponseDto> {
    const definition = this.getDefinitionOrThrow(settingKey);
    const { value, source } = await this.resolveValue(definition, scope);
    return this.mapper.toResponseDto(definition, value, source);
  }

  async updateSetting(
    settingKey: string,
    value: SettingValue,
    scope: SettingScopeContext = GLOBAL_SCOPE,
    actorId: string | null = null
  ): Promise<SettingResponseDto> {
    const definition = this.getDefinitionOrThrow(settingKey);
    this.validator.assertWritable(definition);
    this.validator.validate(definition, value);

    await this.repository.upsert(
      definition.category,
      definition.key,
      value as never,
      scope,
      actorId
    );
    const { value: resolved, source } = await this.resolveValue(definition, scope);
    return this.mapper.toResponseDto(definition, resolved, source, { reveal: true });
  }

  async bulkUpdateCategory(
    category: SettingCategory,
    entries: SettingEntryDto[],
    scope: SettingScopeContext = GLOBAL_SCOPE,
    actorId: string | null = null
  ): Promise<SettingResponseDto[]> {
    const results: SettingResponseDto[] = [];
    for (const entry of entries) {
      results.push(
        await this.updateSetting(
          buildSettingKey(category, entry.key),
          entry.value as SettingValue,
          scope,
          actorId
        )
      );
    }
    return results;
  }

  async resetCategory(
    category: SettingCategory,
    scope: SettingScopeContext = GLOBAL_SCOPE,
    actorId: string | null = null
  ): Promise<number> {
    const definitions = getSettingDefinitions(category);
    await this.repository.deleteCategoryOverrides(category, scope, actorId);
    return definitions.length;
  }

  async resetAll(
    scope: SettingScopeContext = GLOBAL_SCOPE,
    actorId: string | null = null
  ): Promise<number> {
    await this.repository.deleteAllOverrides(scope, actorId);
    return getSettingDefinitions().length;
  }

  async exportSettings(scope: SettingScopeContext = GLOBAL_SCOPE): Promise<ExportSettingsDto> {
    return {
      exportedAt: new Date().toISOString(),
      settings: await this.getAll(scope),
    };
  }

  async importSettings(
    entries: ImportSettingEntryDto[],
    scope: SettingScopeContext = GLOBAL_SCOPE,
    actorId: string | null = null
  ): Promise<ImportSettingsResultDto> {
    const skippedKeys: string[] = [];
    let imported = 0;

    for (const entry of entries) {
      const definition = SETTING_DEFINITION_MAP.get(entry.key);
      if (!definition || definition.isReadOnly) {
        skippedKeys.push(entry.key);
        continue;
      }
      try {
        this.validator.validate(definition, entry.value as SettingValue);
        await this.repository.upsert(
          definition.category,
          definition.key,
          entry.value as never,
          scope,
          actorId
        );
        imported += 1;
      } catch {
        skippedKeys.push(entry.key);
      }
    }

    return { imported, skipped: skippedKeys.length, skippedKeys };
  }
}
