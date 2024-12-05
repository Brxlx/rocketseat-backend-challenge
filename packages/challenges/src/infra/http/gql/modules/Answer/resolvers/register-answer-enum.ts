import { ANSWER_STATUS } from '@/core/consts';
import { registerEnumType } from '@nestjs/graphql';

export const GQL_ANSWER_STATUS_ENUM = {
  PENDING: ANSWER_STATUS.PENDING.toUpperCase(),
  ERROR: ANSWER_STATUS.ERROR.toUpperCase(),
  DONE: ANSWER_STATUS.DONE.toUpperCase(),
} as const;

registerEnumType(GQL_ANSWER_STATUS_ENUM, {
  name: 'ANSWER_STATUS',
  description: 'Available statuses for answer submissions',
});
