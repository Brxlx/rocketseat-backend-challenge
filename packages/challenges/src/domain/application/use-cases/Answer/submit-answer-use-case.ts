import { Injectable } from '@nestjs/common';
import { AnswersRepository } from '../../repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { Producer } from '../../gateways/Messaging/producer';
import { ChallengeNotFoundError } from '../errors/challenge-not-found.error';
import { EmptyGithubUrlError } from '../errors/empty-github-url.error';
import { InvalidGithubUrlError } from '../errors/invalid-github-url.error';
import { SendingToTopicError } from '../errors/sending-to-topic.error';
import { RepositoryAlreadyExistsError } from '../errors/repository-already-exists';
import { Challenge } from '@/domain/enterprise/entities/Challenge';

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
    await this.validateChallenge(challengeId, repositoryUrl);

    await this.validateGitHubRepository(challengeId, repositoryUrl);

    const repositoryAlreadyExists = await this.answersRepository.findByRepositoryUrl(repositoryUrl);

    if (repositoryAlreadyExists) throw new RepositoryAlreadyExistsError();

    const newAnswer = Answer.create({
      challengeId: new UniqueEntityID(challengeId),
      repositoryUrl,
      grade,
      status,
    });

    const answer = await this.answersRepository.create(newAnswer);

    const response = await this.producer.produce('challenge.correction', answer);

    if (!response) throw new SendingToTopicError();

    // await this.producer.(updatedAnswer);

    return { answer };
  }

  private async validateChallenge(challengeId: string, repositoryUrl: string): Promise<void> {
    const challenge = await this.challengesRepository.findById(challengeId);
    if (!challenge) {
      await this.challengesRepository.create(
        Challenge.create(
          {
            title: 'Desafio não encontrado',
            description: `Desafio ${repositoryUrl} não encontrado`,
          },
          new UniqueEntityID(challengeId),
        ),
      );
      await this.answersRepository.create(
        Answer.create({
          challengeId: new UniqueEntityID(challengeId),
          repositoryUrl,
          grade: null,
          status: ANSWER_STATUS.ERROR,
        }),
      );
      throw new ChallengeNotFoundError();
    }
  }

  private async validateGitHubRepository(challengeId: string, url: string): Promise<boolean> {
    const githubRepoRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;

    if (!url) throw new EmptyGithubUrlError();

    if (!githubRepoRegex.test(url)) {
      const repositoryAlreadyExists = await this.answersRepository.findByRepositoryUrl(url);
      if (repositoryAlreadyExists) throw new RepositoryAlreadyExistsError();

      await this.answersRepository.create(
        Answer.create({
          challengeId: new UniqueEntityID(challengeId),
          repositoryUrl: url,
          grade: null,
          status: ANSWER_STATUS.ERROR,
        }),
      );
      throw new InvalidGithubUrlError();
    }

    return true;
  }
}
