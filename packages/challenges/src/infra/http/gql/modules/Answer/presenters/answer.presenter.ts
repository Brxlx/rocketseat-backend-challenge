import { Answer } from '@/domain/enterprise/entities/Answer';

export class AnswerPresenter {
  static toHTTP(answer: Answer) {
    return {
      id: answer.id.toString(),
      challengeId: answer.challengeId,
      repositoryUrl: answer.repositoryUrl,
      grade: answer.grade,
      status: answer.status,
      createdAt: answer.createdAt,
    };
  }
}
