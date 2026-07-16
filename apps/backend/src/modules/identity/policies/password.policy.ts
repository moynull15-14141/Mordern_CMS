/**
 * Password policy (Milestone 4 §4): minimum length, uppercase, lowercase,
 * number, and special character. Documented here as the single source for
 * both the DTO validator and any future password-strength UI hint.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_POLICY_DESCRIPTION =
  `At least ${PASSWORD_MIN_LENGTH} characters, including one uppercase letter, ` +
  'one lowercase letter, one number, and one special character.';
