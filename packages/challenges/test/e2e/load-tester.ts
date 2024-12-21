import { INestApplication, Injectable } from '@nestjs/common';
import pLimit, { LimitFunction } from 'p-limit';
import request from 'supertest';
import { BatchConfig, TestMetrics } from './types';

/** The `LoadTester` class is responsible for running load tests on a NestJS application. It provides methods to make requests to the application, track metrics, and run batches of requests with configurable parameters.
 *
 *The `makeRequest` method sends a GraphQL mutation request to the application, retrying up to 3 times on failure. It tracks the response time for each successful request and updates the metrics accordingly.
 *
 *The `processBatch` method runs a batch of requests concurrently, using a rate-limiting function to control the number of concurrent requests.
 *
 *The `runTest` method orchestrates the execution of the load test, adjusting the batch configuration for better stability, and logging the progress. It returns the final test metrics, including the total time, successful and failed requests, and the average response time.
 */
@Injectable()
export class LoadTester {
  private metrics: TestMetrics = {
    totalTime: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  };

  private responseTimes: number[] = [];

  constructor(
    private readonly app: INestApplication,
    private readonly challengeId: string,
  ) {}

  /**
   * Sends a GraphQL mutation request to the NestJS application, retrying up to 3 times on failure. Tracks the response time for each successful request and updates the metrics accordingly.
   *
   * @param index - The index of the request being made.
   * @returns A Promise that resolves when the request is complete.
   */
  private async makeRequest(index: number): Promise<void> {
    const startTime = Date.now();
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await request(this.app.getHttpServer())
          .post('/gql')
          .timeout(5000) // Add timeout
          .retry(2) // Enable retries
          .send({
            query: `
              mutation SubmitAnswer($submitAnswerInput: SubmitAnswerInput!) {
                submitAnswer(submitAnswerInput: $submitAnswerInput) {
                  id
                  challengeId
                  repositoryUrl
                  status
                  grade
                  createdAt
                }
              }`,
            variables: {
              submitAnswerInput: {
                challengeId: this.challengeId,
                repositoryUrl: `https://github.com/user/repo-${index}`,
              },
            },
          });

        const endTime = Date.now();
        this.responseTimes.push(endTime - startTime);

        if (response.statusCode === 200) {
          this.metrics.successfulRequests++;
          break;
        }

        attempt++;
      } catch (error: any) {
        if (attempt === maxRetries - 1) {
          this.metrics.failedRequests++;
          console.error(`Final retry failed for request ${index}. Error: ${error.message}`);
        }
        attempt++;
      }
    }
  }

  /** Processes a batch of requests asynchronously using a rate-limiting function.
   *
   *This method is responsible for executing a batch of requests concurrently, while respecting the configured rate limit. It creates an array of promises, where each promise represents a single request, and then waits for all the promises to complete using `Promise.all()`.
   *
   * The `startIndex` parameter specifies the starting index of the batch, and the `batchSize` parameter determines the number of requests to execute. The `limit` parameter is a rate-limiting function that is used to control the concurrency of the requests.
   * */
  private async processBatch(
    startIndex: number,
    batchSize: number,
    limit: LimitFunction,
  ): Promise<void> {
    const promises = Array.from({ length: batchSize }, (_, i) => {
      const messageIndex = startIndex + i;
      return limit(() => this.makeRequest(messageIndex));
    });

    await Promise.all(promises);
  }

  public async runTest(config: BatchConfig): Promise<TestMetrics> {
    // Adjust batch configuration for better stability
    const adjustedConfig = {
      ...config,
      delayBetweenBatches: Math.max(config.delayBetweenBatches, 500),
      concurrentRequests: Math.min(config.concurrentRequests, 10),
    };

    console.log('Iniciando teste de carga com configuração:', adjustedConfig);
    const startTime = Date.now();
    const limit = pLimit(adjustedConfig.concurrentRequests);

    for (let i = 0; i < adjustedConfig.totalMessages; i += adjustedConfig.batchSize) {
      const currentBatchSize = Math.min(adjustedConfig.batchSize, adjustedConfig.totalMessages - i);

      await this.processBatch(i, currentBatchSize, limit);

      if (i + adjustedConfig.batchSize < adjustedConfig.totalMessages) {
        await new Promise((resolve) => setTimeout(resolve, adjustedConfig.delayBetweenBatches));
      }

      // Log do progresso
      const progress = (((i + currentBatchSize) / adjustedConfig.totalMessages) * 100).toFixed(2);
      console.log(`Progresso: ${progress}%`);
    }

    const endTime = Date.now();
    this.metrics.totalTime = endTime - startTime;
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    return this.metrics;
  }
}
