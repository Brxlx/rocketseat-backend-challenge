import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class RepositoryAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.REPOSITORY_ALREADY_EXISTS);
  }
}
