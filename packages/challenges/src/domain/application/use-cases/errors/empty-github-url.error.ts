import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class EmptyGithubUrlError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.EMPTY_GITHUB_URL);
  }
}
