import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from '../../repositories/challenges.repository';

interface DeleteChallengeUseCaseRequest {
  id: string;
}

type DeleteChallengeUseCaseResponse = null;

@Injectable()
export class DeleteChallengeUseCase {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  public async execute({
    id,
  }: DeleteChallengeUseCaseRequest): Promise<DeleteChallengeUseCaseResponse> {
    const challenge = await this.challengesRepository.findById(id);

    if (!challenge) throw new Error('Challenge not found');

    await this.challengesRepository.deleteById(challenge);

    return null;
  }
}
