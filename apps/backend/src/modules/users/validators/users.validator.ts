import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';
import { ThemePreference, ProfileVisibility } from '../constants/user.constants';
import { UserProfile } from '../interfaces/user-profile.interface';
import { UserPreferences } from '../interfaces/user-preferences.interface';

const PHONE_REGEX = /^\+?[0-9()\-.\s]{6,20}$/;
const LOCALE_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;

function fail(message: string): never {
  throw new BusinessException(BusinessErrorCode.RULE_VIOLATION, message, HttpStatus.BAD_REQUEST);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Business-rule validation for the JSON-blob profile/preferences fields
 * (see interfaces/user-metadata.interface.ts) that class-validator DTO
 * decorators can't fully express (partial JSON merges arriving from
 * PATCH /users/me/profile and /preferences). Field-level shape validation
 * for direct request bodies still uses class-validator decorators on the
 * DTOs themselves, per this codebase's existing convention.
 */
@Injectable()
export class UsersValidator {
  validateProfile(profile: Partial<UserProfile>): void {
    if (profile.phone && !PHONE_REGEX.test(profile.phone)) {
      fail('profile.phone must be a valid phone number');
    }
    if (profile.website) {
      try {
        new URL(profile.website);
      } catch {
        fail('profile.website must be a valid URL');
      }
    }
    if (profile.language && !LOCALE_REGEX.test(profile.language)) {
      fail('profile.language must be a valid locale code (e.g. "en" or "en-US")');
    }
    if (
      profile.profileVisibility &&
      !Object.values(ProfileVisibility).includes(profile.profileVisibility)
    ) {
      fail(
        `profile.profileVisibility must be one of [${Object.values(ProfileVisibility).join(', ')}]`
      );
    }
  }

  validatePreferences(preferences: Partial<UserPreferences>): void {
    if (preferences.theme && !Object.values(ThemePreference).includes(preferences.theme)) {
      fail(`preferences.theme must be one of [${Object.values(ThemePreference).join(', ')}]`);
    }
    if (preferences.language && !LOCALE_REGEX.test(preferences.language)) {
      fail('preferences.language must be a valid locale code (e.g. "en" or "en-US")');
    }
    for (const key of [
      'editorPreference',
      'dashboardPreference',
      'accessibilityPreference',
    ] as const) {
      const value = preferences[key];
      if (value !== undefined && !isPlainObject(value)) {
        fail(`preferences.${key} must be a JSON object`);
      }
    }
    if (
      preferences.notificationPreference !== undefined &&
      !isPlainObject(preferences.notificationPreference)
    ) {
      fail('preferences.notificationPreference must be a JSON object');
    }
  }
}
