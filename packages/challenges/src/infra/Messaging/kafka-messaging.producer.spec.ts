import { Test, TestingModule } from '@nestjs/testing';
import { KafkaMessagingProducer } from './kafka-messaging.producer';
import { TestMessagingModule } from 'test/Messaging/test-messaging.module';

describe('KafkaMessagingProducer', () => {
  let producer: KafkaMessagingProducer;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestMessagingModule],
    }).compile();

    producer = module.get<KafkaMessagingProducer>(KafkaMessagingProducer);
  });

  afterEach(async () => {
    // Isso invocará onModuleDestroy automaticamente
    await module.close();
  });

  it('should call onModuleDestroy and log final metrics', async () => {
    const logSpy = vi.spyOn(producer['logger'], 'log');

    // Simula algumas métricas
    producer['metrics'].messagesSent = 5;
    producer['metrics'].messagesFailures = 2;

    // Invoca diretamente
    await producer.onModuleDestroy();
    // console.log('Log spy calls:', JSON.stringify(logSpy.mock.calls));

    expect(logSpy).toHaveBeenCalledWith(
      'Métricas do Kafka Producer',
      expect.objectContaining({
        messagesSent: 5,
        messagesFailures: 2,
      }),
    );
  });
});
