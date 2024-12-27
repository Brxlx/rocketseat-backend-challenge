import { Injectable } from '@nestjs/common';
import { KafkaMessagingProducer } from '@/infra/Messaging/kafka-messaging.producer';
import { Answer } from '@/domain/enterprise/entities/Answer';

/**
 * Implementação fake do KafkaMessagingProducer para testes
 * Simplifica a lógica de mensageria removendo a dependência real do Kafka
 */
@Injectable()
export class FakeKafkaMessagingProducer extends KafkaMessagingProducer {
  // Override connection methods to prevent actual Kafka connections
  async onModuleInit(): Promise<void> {
    return Promise.resolve();
  }

  async onModuleDestroy(): Promise<void> {
    return Promise.resolve();
  }
  /**
   * Sobrescreve o método de envio de mensagens do producer real
   * Retorna uma Promise resolvida imediatamente para simular o envio
   */
  async produce(topic: string, message: Answer): Promise<Answer> {
    // Simula o envio da mensagem sem necessidade de conexão real
    return Promise.resolve(
      Answer.create({
        challengeId: message.challengeId,
        repositoryUrl: message.repositoryUrl,
      }),
    );
  }
}
