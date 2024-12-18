import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaMessagingProducer } from './kafka-messaging.producer';
import { EnvModule } from '../env/env.module';
import { DatabaseModule } from '../database/database.module';
import { Producer } from '@/domain/application/gateways/Messaging/producer';
import { Partitioners } from 'kafkajs';
import { EnvService } from '../env/env.service';

@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [EnvModule],
        useFactory: async (envService: EnvService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'challenges',
              brokers: envService.get('KAFKA_BROKERS').split(','),
            },
            consumer: {
              groupId: 'challenges-consumer',
              allowAutoTopicCreation: true,
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [EnvService],
      },
    ]),
  ],
  providers: [{ provide: Producer, useClass: KafkaMessagingProducer }],
  exports: [ClientsModule, Producer],
})
export class MessagingModule {}
