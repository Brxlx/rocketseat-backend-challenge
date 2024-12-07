import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class SendingToTopicError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.ERROR_SENDING_TO_TOPIC);
  }
}
