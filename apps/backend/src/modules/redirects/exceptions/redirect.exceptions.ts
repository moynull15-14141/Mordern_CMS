import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';

export class RedirectNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `Redirect "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class RedirectAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Redirect "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class RedirectNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Redirect "${id}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class RedirectSourceConflictException extends BusinessException {
  constructor(sourcePath: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `A redirect from "${sourcePath}" already exists.`,
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidRedirectPathException extends BusinessException {
  constructor(field: 'sourcePath' | 'destinationUrl', value: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      field === 'sourcePath'
        ? `"${value}" is not a valid source path.`
        : `"${value}" is not a valid destination — use an internal path (e.g. /about) or a full https:// URL.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class SelfRedirectException extends BusinessException {
  constructor(path: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `"${path}" cannot redirect to itself.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class RedirectLoopException extends BusinessException {
  constructor(sourcePath: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `This redirect would create a loop back to "${sourcePath}".`,
      HttpStatus.BAD_REQUEST
    );
  }
}
