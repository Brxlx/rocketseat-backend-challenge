import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { registerEnumType } from '@nestjs/graphql';

export enum GQL_ANSWER_STATUS_ENUM {
  PENDING = ANSWER_STATUS.PENDING,
  ERROR = ANSWER_STATUS.ERROR,
  DONE = ANSWER_STATUS.DONE,
}

registerEnumType(GQL_ANSWER_STATUS_ENUM, {
  name: 'ANSWER_STATUS',
  description: 'Available statuses for answer submissions',
});
