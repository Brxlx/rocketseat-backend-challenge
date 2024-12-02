import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Injectable } from '@nestjs/common';

interface CreateChallengeUseCaseRequest {
  title: string;
  description: string;
}

type CreateChallengeUseCaseResponse = { challenge: Challenge };

@Injectable()
export class CreateChallengeUseCase {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  public async execute({
    title,
    description,
  }: CreateChallengeUseCaseRequest): Promise<CreateChallengeUseCaseResponse> {
    const titleAlreadyExists = await this.challengesRepository.findByTitle(title);

    if (titleAlreadyExists) throw new Error('Title already exists');

    const challenge = Challenge.create({ title, description });
    const newChallenge = await this.challengesRepository.create(challenge);

    return { challenge: newChallenge };
  }
}
