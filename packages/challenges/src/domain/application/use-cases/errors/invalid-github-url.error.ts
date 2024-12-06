import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidGithubUrlError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.INVALID_GITHUB_URL);
  }
}
