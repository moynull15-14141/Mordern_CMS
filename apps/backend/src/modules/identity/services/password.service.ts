import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/** bcrypt is used here specifically because passwords are low-entropy,
 * human-chosen secrets — its slow, salted, adaptive hashing is what resists
 * offline brute-forcing. High-entropy tokens (refresh/reset/verification)
 * use TokenService's SHA-256 hashing instead; bcrypt would only add latency
 * there without a security benefit. */
@Injectable()
export class PasswordService {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
