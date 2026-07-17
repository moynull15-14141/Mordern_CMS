import type { AuthTokens, CurrentUser } from '@/types/auth';

/** Shared test fixture matching the backend's real AuthTokensDto shape
 * exactly (modules/identity/dto/auth-tokens.dto.ts) — avoids every test
 * file hand-rolling a slightly different fake login response. */
export function mockCurrentUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: null,
    displayName: null,
    status: 'ACTIVE',
    ...overrides,
  };
}

export function mockAuthTokens(overrides: Partial<AuthTokens> = {}): AuthTokens {
  return {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: '15m',
    tokenType: 'Bearer',
    user: mockCurrentUser(),
    ...overrides,
  };
}
