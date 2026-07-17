import { SessionResponseDto } from './session-response.dto';

describe('SessionResponseDto shape', () => {
  it('holds every session field, with device-metadata fields nullable', () => {
    const dto: SessionResponseDto = {
      id: 'session-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      deviceName: 'My Laptop',
      browser: null,
      operatingSystem: null,
      country: null,
      city: null,
      rememberMe: true,
      lastSeenAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-02-01T00:00:00.000Z',
      revokedAt: null,
    };
    expect(dto.id).toBe('session-1');
    expect(dto.rememberMe).toBe(true);
    expect(dto.browser).toBeNull();
    expect(dto.revokedAt).toBeNull();
  });

  it('revokedAt is populated once a session is revoked', () => {
    const dto: SessionResponseDto = {
      id: 'session-2',
      ipAddress: null,
      userAgent: null,
      deviceName: null,
      browser: null,
      operatingSystem: null,
      country: null,
      city: null,
      rememberMe: false,
      lastSeenAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-02-01T00:00:00.000Z',
      revokedAt: '2026-01-15T00:00:00.000Z',
    };
    expect(dto.revokedAt).toBe('2026-01-15T00:00:00.000Z');
  });
});
