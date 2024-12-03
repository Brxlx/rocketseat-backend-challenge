import { ANSWER_STATUS } from '../consts';

export interface AnswerFilters {
  challengeId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ANSWER_STATUS;
}
