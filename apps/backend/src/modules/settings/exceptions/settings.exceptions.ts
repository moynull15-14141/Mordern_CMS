import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

/** Requested `category.key` is not in `SETTING_DEFINITIONS` — Milestone 6 is
 * a closed vocabulary, never an arbitrary user-supplied key. */
export class SettingNotFoundException extends BusinessException {
  constructor(settingKey: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Setting "${settingKey}" is not a recognized setting.`,
      HttpStatus.NOT_FOUND
    );
  }
}

/** Attempted write to a setting flagged `isReadOnly: true` in its definition
 * (e.g. values that mirror env-only infrastructure config). */
export class SettingReadOnlyException extends BusinessException {
  constructor(settingKey: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Setting "${settingKey}" is read-only and cannot be modified via the API.`,
      HttpStatus.FORBIDDEN
    );
  }
}

/** Raised by SettingsValidator when a value fails its definition's
 * validation rules (type, min/max, regex, allowedValues, required/nullable).
 * Extends HttpException directly (not BusinessException, which is typed to
 * BusinessErrorCode) since this is a ValidationErrorCode failure. */
export class SettingValidationException extends HttpException {
  constructor(
    public readonly settingKey: string,
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super(
      { code, message: `Setting "${settingKey}" is invalid: ${reason}` },
      HttpStatus.BAD_REQUEST
    );
  }
}
