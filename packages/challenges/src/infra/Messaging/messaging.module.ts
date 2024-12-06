import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaMessagingProducer } from './kafka-messaging.producer';
import { EnvModule } from '../env/env.module';
import { DatabaseModule } from '../database/database.module';
import { Producer } from '@/domain/application/gateways/Messaging/producer';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    EnvModule,
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'challenges',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'challenges-consumer-group',
            allowAutoTopicCreation: true,
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  providers: [{ provide: Producer, useClass: KafkaMessagingProducer }],
  exports: [ClientsModule, Producer],
})
export class MessagingModule {}
