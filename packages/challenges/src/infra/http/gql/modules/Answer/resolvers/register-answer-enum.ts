import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { registerEnumType } from '@nestjs/graphql';

export enum GQL_ANSWER_STATUS_ENUM {
  PENDING = ANSWER_STATUS.PENDING,
  ERROR = ANSWER_STATUS.ERROR,
  DONE = ANSWER_STATUS.DONE,
}

registerEnumType(GQL_ANSWER_STATUS_ENUM, {
  name: 'ANSWER_STATUS',
  description: 'Status possíveis para uma resposta',
  valuesMap: {
    [ANSWER_STATUS.PENDING]: {
      description: 'Pending',
    },
    [ANSWER_STATUS.ERROR]: {
      description: 'Error',
    },
    [ANSWER_STATUS.DONE]: {
      description: 'Done',
    },
  },
});
