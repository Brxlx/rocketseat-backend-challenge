import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaMessagingProducer } from '@/infra/Messaging/kafka-messaging.producer';
import { EnvService } from '@/infra/env/env.service';
import { EnvModule } from '@/infra/env/env.module';
import { TestKafkaMessagingProducer } from './test-messaging-producer';
import { DatabaseModule } from '@/infra/database/database.module';

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
              brokers: [envService.get('KAFKA_BROKERS')],
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
  ],
  exports: [TestKafkaMessagingProducer],
})
export class TestMessagingModule {}
