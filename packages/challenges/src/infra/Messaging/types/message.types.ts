export interface MessagePayload {
  value: {
    submissionId: string;
    repositoryUrl: string;
  };
}

export interface CorrectLessonResponse {
  grade: number;
  status: string;
}

export interface KafkaProducerConfig {
  maxRetries: number;
  baseTimeout: number;
  exponentialBackoffBase: number;
  circuitBreakerThreshold: number;
}

export interface ProducerMetrics {
  messagesSent: number;
  messagesFailures: number;
  consecutiveFailures: number;
  lastFailureTime?: Date;
}

export enum ProducerErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
}
