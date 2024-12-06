import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class TitleAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.TITLE_ALREADY_EXISTS);
  }
}
