export interface BatchConfig {
  totalMessages: number; // Número total de mensagens a serem enviadas
  batchSize: number; // Tamanho de cada batch
  delayBetweenBatches: number; // Delay entre batches em ms
  concurrentRequests: number; // Número máximo de requisições concorrentes
}

export interface TestMetrics {
  totalTime: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}
