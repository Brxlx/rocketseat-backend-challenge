import { Injectable } from '@nestjs/common';
import { AnswersRepository } from '../../repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { ANSWER_STATUS } from '@/core/consts';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Producer } from '../../gateways/Messaging/producer';
import { ChallengeNotFoundError } from '../errors/challenge-not-found.error';
import { EmptyGithubUrlError } from '../errors/empty-github-url.error';
import { InvalidGithubUrlError } from '../errors/invalid-github-url.error';

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

    await this.producer.produce('challenge.correction', answer);

    // await this.producer.(updatedAnswer);

    return { answer };
  }

  private async validateChallenge(challengeId: string): Promise<void> {
    const challenge = await this.challengesRepository.findById(challengeId);
    if (!challenge) {
      throw new ChallengeNotFoundError();
    }
  }

  private validateGitHubRepository(url: string): boolean {
    // Lógica de validação do repositório GitHub
    const githubRepoRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;

    if (!url) throw new EmptyGithubUrlError();

    if (!githubRepoRegex.test(url)) throw new InvalidGithubUrlError();

    return true;
  }
}
