import { Injectable } from '@nestjs/common';
import { AnswersRepository } from '../../repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { ANSWER_STATUS } from '@/core/consts';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Producer } from '../../gateways/Messaging/producer';

interface SubmitAnswerUseCaseRequest {
  challengeId: string;
  repositoryUrl: string;
  grade?: number | null;
  status?: ANSWER_STATUS;
}

type SubmitAnswerUseCaseResponse = { answer: Answer };

@Injectable()
export class SubmitAnswerUseCase {
  constructor(
    private readonly answersRepository: AnswersRepository,
    private readonly challengesRepository: ChallengesRepository,
    private readonly producer: Producer,
  ) {}

  public async execute({
    challengeId,
    repositoryUrl,
    grade,
    status,
  }: SubmitAnswerUseCaseRequest): Promise<SubmitAnswerUseCaseResponse> {
    await this.validateChallenge(challengeId);

    this.validateGitHubRepository(repositoryUrl);

    const newAnswer = Answer.create({
      challengeId: new UniqueEntityID(challengeId),
      repositoryUrl,
      grade,
      status,
    });

    const answer = await this.answersRepository.create(newAnswer);

    const updatedAnswer = await this.producer.produce('challenge.correction', answer);

    // await this.producer.(updatedAnswer);

    return { answer };
  }

  private async validateChallenge(challengeId: string): Promise<void> {
    const challenge = await this.challengesRepository.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }
  }

  private validateGitHubRepository(url: string): boolean {
    // Lógica de validação do repositório GitHub
    const githubRepoRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;

    if (!url) throw new Error('GitHub repository URL cannot be empty');

    if (!githubRepoRegex.test(url)) throw new Error('Invalid GitHub repository URL');

    return true;
  }
}
