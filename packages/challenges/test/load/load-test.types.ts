import { ANSWER_STATUS } from '@/core/consts/answer-status';

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
