import { ANSWER_STATUS } from '../consts/answer-status';

export interface AnswerFilters {
  challengeId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ANSWER_STATUS;
}
