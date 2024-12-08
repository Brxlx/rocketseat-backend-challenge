import { Producer } from '@/domain/application/gateways/Messaging/producer';
import { Answer } from '@/domain/enterprise/entities/Answer';

export class FakeMessaging implements Producer {
  async produce(topic: string | string[], message: Answer): Promise<Answer | undefined> {
    console.log(`Producing to topic ${topic} the message:  ${message}`);
    return Answer.create({
      challengeId: message.challengeId,
      repositoryUrl: message.repositoryUrl,
      grade: message.grade,
      status: message.status,
    });
  }
}
