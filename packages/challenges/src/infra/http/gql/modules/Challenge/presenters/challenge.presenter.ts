import { Challenge } from '@/domain/enterprise/entities/Challenge';

export class ChallengePresenter {
  static toHTTP(challenge: Challenge) {
    return {
      id: challenge.id.toString(),
      title: challenge.title,
      description: challenge.description,
      createdAt: challenge.createdAt,
    };
  }
}
