import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { ChallengeNotFoundError } from '../errors/challenge-not-found.error';
import { TitleAlreadyExistsError } from '../errors/title-already-exists.error';

interface EditChallengeUseCaseRequest {
  id: string;
  title?: string;
  description?: string;
}

type EditChallengeUseCaseResponse = { challenge: Challenge };

@Injectable()
export class EditChallengeUseCase {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  public async execute({
    id,
    title,
    description,
  }: EditChallengeUseCaseRequest): Promise<EditChallengeUseCaseResponse> {
    const challenge = await this.challengesRepository.findById(id);

    if (!challenge) throw new ChallengeNotFoundError();

    if (title) {
      // Check if title is a defined argument and update its value on class level
      const checkIfTitleAlreadyExists = await this.challengesRepository.findByTitle(title);
      if (checkIfTitleAlreadyExists) throw new TitleAlreadyExistsError();
      challenge.title = title;
    }

    // Check if description is a defined argument and update its value on class level
    if (description) challenge.description = description;

    // Save changes to database
    const updatedChallenge = await this.challengesRepository.update(challenge);

    return { challenge: updatedChallenge };
  }
}
