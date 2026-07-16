import { AuthenticationErrorCode } from './authentication-error.codes';
import { AuthorizationErrorCode } from './authorization-error.codes';
import { BusinessErrorCode } from './business-error.codes';
import { InfrastructureErrorCode } from './infrastructure-error.codes';
import { SystemErrorCode } from './system-error.codes';
import { ValidationErrorCode } from './validation-error.codes';

export * from './authentication-error.codes';
export * from './authorization-error.codes';
export * from './business-error.codes';
export * from './infrastructure-error.codes';
export * from './system-error.codes';
export * from './validation-error.codes';

/**
 * Union of every category's error code. Each category owns its own enum
 * (business / validation / authentication / authorization / infrastructure /
 * system) so codes stay organized as the error surface grows in later
 * business modules.
 */
export type ErrorCode =
  | BusinessErrorCode
  | ValidationErrorCode
  | AuthenticationErrorCode
  | AuthorizationErrorCode
  | InfrastructureErrorCode
  | SystemErrorCode;

const SECURITY_RELEVANT_CODES: string[] = [
  ...Object.values(AuthenticationErrorCode),
  ...Object.values(AuthorizationErrorCode),
  SystemErrorCode.RATE_LIMITED,
];

export function isSecurityRelevantCode(code: string): boolean {
  return SECURITY_RELEVANT_CODES.includes(code);
}
