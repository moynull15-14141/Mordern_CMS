import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes a password to a different string', async () => {
    const hash = await service.hash('StrongP@ssw0rd');
    expect(hash).not.toEqual('StrongP@ssw0rd');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces a different hash for the same password on each call (salted)', async () => {
    const [first, second] = await Promise.all([
      service.hash('StrongP@ssw0rd'),
      service.hash('StrongP@ssw0rd'),
    ]);
    expect(first).not.toEqual(second);
  });

  it('compare() returns true for the correct password', async () => {
    const hash = await service.hash('StrongP@ssw0rd');
    await expect(service.compare('StrongP@ssw0rd', hash)).resolves.toBe(true);
  });

  it('compare() returns false for the wrong password', async () => {
    const hash = await service.hash('StrongP@ssw0rd');
    await expect(service.compare('WrongPassword', hash)).resolves.toBe(false);
  });
});
