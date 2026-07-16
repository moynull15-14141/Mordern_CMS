import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  /** Session/refresh-token lifetime when the client requests "remember me" at login. */
  rememberMeExpiresIn: process.env.AUTH_REMEMBER_ME_EXPIRES_IN ?? '30d',
  passwordResetTokenExpiresIn: process.env.AUTH_PASSWORD_RESET_EXPIRES_IN ?? '1h',
  emailVerificationTokenExpiresIn: process.env.AUTH_EMAIL_VERIFICATION_EXPIRES_IN ?? '24h',
}));
