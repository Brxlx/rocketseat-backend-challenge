import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';

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

    if (!challenge) throw new Error('Challenge not found');

    if (title) {
      // Check if title is a defined argument and update its value on class level
      const checkIfTitleAlreadyExists = await this.challengesRepository.findByTitle(title);
      if (checkIfTitleAlreadyExists) throw new Error('Title already in use');
      challenge.title = title;
    }

    // Check if description is a defined argument and update its value on class level
    if (description) challenge.description = description;

    // Save changes to database
    const updatedChallenge = await this.challengesRepository.update(challenge);

    console.log(updatedChallenge);

    return { challenge: updatedChallenge };
  }
}
