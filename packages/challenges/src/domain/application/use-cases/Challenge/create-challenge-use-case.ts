import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Injectable } from '@nestjs/common';
import { TitleAlreadyExistsError } from '../errors/title-already-exists.error';

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

    if (titleAlreadyExists) throw new TitleAlreadyExistsError();

    const challenge = Challenge.create({ title, description });
    const newChallenge = await this.challengesRepository.create(challenge);

    return { challenge: newChallenge };
  }
}
