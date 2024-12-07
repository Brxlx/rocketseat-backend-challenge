import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class InternalServerError extends Error implements UseCaseError {
  constructor(message: string) {
    super(`${UseCaseErrorMessages.EMPTY_GITHUB_URL}: ${message}`);
  }
}
