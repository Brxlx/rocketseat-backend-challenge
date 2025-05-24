import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaMessagingProducer } from '@/infra/Messaging/kafka-messaging.producer';
import { EnvService } from '@/infra/env/env.service';
import { EnvModule } from '@/infra/env/env.module';
import { TestKafkaMessagingProducer } from './test-messaging-producer';
import { DatabaseModule } from '@/infra/database/database.module';
import { StatusTransformer } from '@/domain/application/gateways/Messaging/status-transformer';
import { TestStatusTransformerService } from './test-status-transformer';
import { CircuitBreaker } from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { TestCircuitBreakerService } from 'test/Circuit Breaker/fake-circuit-breaker';

@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [EnvModule],
        useFactory: (envService: EnvService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'challenges-test',
              brokers: envService.get('KAFKA_BROKERS').split(','),
            },
            consumer: {
              groupId: 'challenges-test-consumer',
            },
          },
        }),
        inject: [EnvService],
      },
    ]),
  ],
  providers: [
    TestKafkaMessagingProducer,
    {
      provide: KafkaMessagingProducer,
      useClass: TestKafkaMessagingProducer,
    },
    {
      provide: StatusTransformer,
      useClass: TestStatusTransformerService,
    },
    {
      provide: CircuitBreaker,
      useClass: TestCircuitBreakerService,
    },
  ],
  exports: [TestKafkaMessagingProducer, StatusTransformer, CircuitBreaker],
})
export class TestMessagingModule {}
