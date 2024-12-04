import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from '../../repositories/challenges.repository';

export type DeleteChallengeUseCaseResponse = null;

@Injectable()
export class DeleteChallengeUseCase {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  public async execute(id: string): Promise<DeleteChallengeUseCaseResponse> {
    const challenge = await this.challengesRepository.findById(id);

    if (!challenge) throw new Error('Challenge not found');

    await this.challengesRepository.deleteById(challenge.id.toString());

    return null;
  }
}
