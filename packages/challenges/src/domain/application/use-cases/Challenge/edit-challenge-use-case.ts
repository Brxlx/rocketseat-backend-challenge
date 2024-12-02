import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';

interface EditChallengeUseCaseRequest {
  id: string;
  description: string;
}

type EditChallengeUseCaseResponse = { challenge: Challenge };

@Injectable()
export class EditChallengeUseCase {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  public async execute({
    id,
    description,
  }: EditChallengeUseCaseRequest): Promise<EditChallengeUseCaseResponse> {
    const challenge = await this.challengesRepository.findById(id);

    if (!challenge) throw new Error('Challenge not found');

    challenge.description = description;

    await this.challengesRepository.update(challenge);

    return { challenge };
  }
}
