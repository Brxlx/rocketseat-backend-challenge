import { ProducerErrorType } from '@/infra/Messaging/types/message.types';

/**
 * Classe personalizada para erros do Producer
 */
export class ProducerError extends Error {
  constructor(
    message: string,
    public readonly type: ProducerErrorType,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'ProducerError';
  }
}
