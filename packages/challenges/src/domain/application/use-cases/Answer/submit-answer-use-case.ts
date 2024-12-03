import { Injectable } from '@nestjs/common';
import { AnswersRepository } from '../../repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { ANSWER_STATUS } from '@/core/consts';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ChallengesRepository } from '../../repositories/challenges.repository';

interface SubmitAnswerUseCaseRequest {
  challengeId: string;
  repositoryUrl: string;
  grade?: number | null;
  status: ANSWER_STATUS;
}

type SubmitAnswerUseCaseResponse = { answer: Answer };

@Injectable()
export class SubmitAnswerUseCase {
  constructor(
    private readonly answersRepository: AnswersRepository,
    private readonly challengesRepository: ChallengesRepository,
  ) {}

  public async execute({
    challengeId,
    repositoryUrl,
    grade,
    status,
  }: SubmitAnswerUseCaseRequest): Promise<SubmitAnswerUseCaseResponse> {
    const verifiyChallengeId = await this.challengesRepository.findById(challengeId);

    if (!verifiyChallengeId) throw new Error('Challenge not found');

    this.validateGitHubRepository(repositoryUrl);

    const newAnswer = Answer.create({
      challengeId: new UniqueEntityID(challengeId),
      repositoryUrl,
      grade,
      status,
    });
    const answer = await this.answersRepository.create(newAnswer);

    return { answer };
  }

  private validateGitHubRepository(url: string): boolean {
    // Lógica de validação do repositório GitHub
    const githubRepoRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;

    if (!url) throw new Error('GitHub repository URL cannot be empty');

    if (!githubRepoRegex.test(url)) throw new Error('Invalid GitHub repository URL');

    return true;
  }
}
