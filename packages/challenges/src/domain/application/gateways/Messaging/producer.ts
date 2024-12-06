import { Answer } from '@/domain/enterprise/entities/Answer';

export abstract class Producer {
  abstract produce(topic: string | string[], message: Answer): Promise<Answer | undefined>;
}
