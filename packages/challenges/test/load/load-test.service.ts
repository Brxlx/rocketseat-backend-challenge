import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import {
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  takeWhile,
  timer,
  switchMap,
  takeLast,
  toArray,
} from 'rxjs';
import request from 'supertest';
import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { EnvService } from '@/infra/env/env.service';
/**
 * Interface para configuração do teste de carga
 */
export interface LoadTestConfig {
  parallelMessages: number;
  delayBetweenMessages: number;
  numOfBatches: number;
  batchSize: number;
  pollInterval: number;
  maxAttempts: number;
}

/**
 * Interface para resultado de uma submissão
 */
export interface SubmissionResult {
  answerId: string;
  status: ANSWER_STATUS;
  attempts: number;
  processingTime: number;
}

/**
 * Interface para métricas do teste
 */
export interface TestMetrics {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  successRate: string;
  errorRate: string;
  totalTime: number;
  averageTimePerRequest: number;
  averageProcessingTime: number;
}

/**
 * Token para injeção da aplicação NestJS
 */
export const NEST_APP_TOKEN = 'NEST_APP_TOKEN';

// Criamos um provider factory para o app
export const createAppProvider = (app: INestApplication) => ({
  provide: NEST_APP_TOKEN,
  useValue: app,
});

/**
 * Classe responsável por executar e gerenciar testes de carga
 */
@Injectable()
export class LoadTestService {
  private app: INestApplication = {} as INestApplication;

  constructor(
    private readonly envService: EnvService,
    private readonly prisma: PrismaService,
  ) {
    console.log(this.envService.get('DATABASE_URL'));
  }

  /**
   * Método para configurar a instância da aplicação
   * @param app Instância do NestApplication
   */
  setApp(app: INestApplication) {
    console.log('Setting up app...');
    if (!app) {
      throw new Error('NestApplication instance cannot be null or undefined');
    }
    this.app = app;
  }

  private static readonly DEFAULT_CONFIG: LoadTestConfig = {
    parallelMessages: 3,
    delayBetweenMessages: 100,
    numOfBatches: 1,
    batchSize: 10,
    pollInterval: 500,
    maxAttempts: 10,
  };

  private readonly testLogger = {
    group: (name: string) => {
      console.log('\n' + '━'.repeat(80));
      console.log(`🔍 ${name}`);
      console.log('━'.repeat(80));
    },
    metrics: (data: Record<string, any>) => {
      console.log('\n📊 Test Metrics:');
      console.log('━'.repeat(40));
      Object.entries(data).forEach(([key, value]) => {
        console.log(`${key.padEnd(25)}: ${value}`);
      });
      console.log('━'.repeat(40));
    },
  };

  /**
   * Executa o teste de carga com a configuração especificada
   */
  async executeLoadTest(
    challenge: Challenge,
    config: Partial<LoadTestConfig> = {},
  ): Promise<TestMetrics> {
    const startTime = Date.now();
    const finalConfig = { ...LoadTestService.DEFAULT_CONFIG, ...config };

    const results = await this.processAllBatches(challenge, finalConfig);
    const metrics = this.calculateMetrics(results, startTime);

    this.logResults(metrics);
    return metrics;
  }

  /**
   * Processa todos os lotes de submissões
   */
  private async processAllBatches(
    challenge: Challenge,
    config: LoadTestConfig,
  ): Promise<SubmissionResult[]> {
    const totalSubmissions = config.batchSize * config.numOfBatches;
    const submissions = Array.from({ length: totalSubmissions }, (_, index) => index);

    const batches = this.createBatches(submissions, config.batchSize);
    const results: SubmissionResult[] = [];

    for (const batch of batches) {
      const batchResults = await this.processBatch(challenge, batch, config);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Cria os lotes de submissões
   */
  private createBatches(submissions: number[], batchSize: number): number[][] {
    return Array.from({ length: Math.ceil(submissions.length / batchSize) }, (_, index) =>
      submissions.slice(index * batchSize, (index + 1) * batchSize),
    );
  }

  /**
   * Processa um único lote de submissões
   */
  private async processBatch(
    challenge: Challenge,
    batch: number[],
    config: LoadTestConfig,
  ): Promise<SubmissionResult[]> {
    return lastValueFrom(
      from(batch).pipe(
        mergeMap(async (index) => {
          const answerId = await this.submitAnswer(challenge.id.toString(), index);
          await new Promise((resolve) => setTimeout(resolve, config.delayBetweenMessages));
          return this.monitorAnswerStatus(answerId, config.maxAttempts, config.pollInterval).pipe(
            takeLast(1),
          );
        }, config.parallelMessages),
        mergeMap((observable) => observable),
        toArray(),
      ),
    );
  }

  /**
   * Submete uma única resposta
   */
  private async submitAnswer(challengeId: string, index: number): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/gql')
      .send({
        query: `
          mutation SubmitAnswer($input: SubmitAnswerInput!) {
            submitAnswer(submitAnswerInput: $input) {
              id
              challengeId
              status
            }
          }
        `,
        variables: {
          input: {
            challengeId: challengeId,
            repositoryUrl: `https://github.com/user/repo-${Date.now()}-${index}`,
          },
        },
      });

    return response.body.data.submitAnswer.id;
  }

  /**
   * Monitora o status de uma resposta
   */
  private monitorAnswerStatus(
    answerId: string,
    maxAttempts: number,
    pollInterval: number,
  ): Observable<SubmissionResult> {
    const startTime = Date.now();

    return timer(0, pollInterval).pipe(
      switchMap(async (attempt) => {
        const answer = await this.prisma.answer.findUnique({
          where: { id: answerId },
        });

        if (!answer) {
          throw new Error(`Answer ${answerId} not found`);
        }

        return {
          answerId,
          status: answer.status as ANSWER_STATUS,
          attempts: attempt + 1,
          processingTime: Date.now() - startTime,
        };
      }),
      takeWhile(
        (result) => result.status === ANSWER_STATUS.PENDING && result.attempts < maxAttempts,
        true,
      ),
      map((result) => {
        if (result.status === ANSWER_STATUS.PENDING && result.attempts >= maxAttempts) {
          return { ...result, status: ANSWER_STATUS.ERROR };
        }
        return result;
      }),
    );
  }

  /**
   * Calcula as métricas do teste
   */
  private calculateMetrics(results: SubmissionResult[], startTime: number): TestMetrics {
    const successResults = results.filter((r) => r.status === ANSWER_STATUS.DONE);
    const errorResults = results.filter((r) => r.status === ANSWER_STATUS.ERROR);
    const totalTime = Date.now() - startTime;

    return {
      totalSubmissions: results.length,
      successfulSubmissions: successResults.length,
      failedSubmissions: errorResults.length,
      successRate: `${((successResults.length / results.length) * 100).toFixed(2)}%`,
      errorRate: `${((errorResults.length / results.length) * 100).toFixed(2)}%`,
      totalTime,
      averageTimePerRequest: totalTime / results.length,
      averageProcessingTime: results.reduce((acc, r) => acc + r.processingTime, 0) / results.length,
    };
  }

  /**
   * Registra os resultados do teste
   */
  private logResults(metrics: TestMetrics): void {
    this.testLogger.group('Answer Submission Load Test Results');
    this.testLogger.metrics({
      'Total Submissions': metrics.totalSubmissions,
      'Successful Submissions': metrics.successfulSubmissions,
      'Failed Submissions': metrics.failedSubmissions,
      'Success Rate': metrics.successRate,
      'Error Rate': metrics.errorRate,
      'Total Time': `${metrics.totalTime}ms`,
      'Average Time Per Request': `${metrics.averageTimePerRequest.toFixed(2)}ms`,
      'Average Processing Time': `${metrics.averageProcessingTime.toFixed(2)}ms`,
    });
  }
}
