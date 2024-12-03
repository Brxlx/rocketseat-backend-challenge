/**
 * Represents the possible statuses for an answer submission.
 * @property {string} PENDING - The submission is pending review.
 * @property {string} ACCEPTED - The submission has been accepted.
 * @property {string} REJECTED - The submission has been rejected.
 */
export enum ANSWER_STATUS {
  PENDING = 'pending',
  ERROR = 'error',
  DONE = 'done',
}
