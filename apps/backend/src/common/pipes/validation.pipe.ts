import { Injectable, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

const DEFAULT_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
};

/**
 * Central default for request validation so every module gets the same
 * whitelist/transform behavior instead of repeating ValidationPipe options
 * per controller. No entity-specific validation lives here.
 */
@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions = {}) {
    super({ ...DEFAULT_OPTIONS, ...options });
  }
}
