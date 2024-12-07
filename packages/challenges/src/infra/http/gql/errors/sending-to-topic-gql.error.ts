import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from '@/infra/http/gql/errors/custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class SendingToTopicGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.ERROR_SENDING_TO_TOPIC, HttpStatus.EXPECTATION_FAILED, {
      code: 'ERROR_SENDING_TO_TOPIC',
      statusCode: HttpStatus.EXPECTATION_FAILED,
    });

    this.stack = undefined;
  }
}
