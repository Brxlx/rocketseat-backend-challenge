import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class ChallengeNotFoundError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.CHALLENGE_NOT_FOUND);
  }
}
