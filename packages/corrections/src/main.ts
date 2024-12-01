import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'challenge-consumer',
        },
        producer: {
          createPartitioner: Partitioners.LegacyPartitioner
        }
      },
    },
  );

  app.listen().then(() => console.log('Kafka consumer service is listening!'));
}
bootstrap();
