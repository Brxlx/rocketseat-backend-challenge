import { FetchAnswersUseCase } from '@/domain/application/use-cases/Answer/fetch-answers-use.case';
import { SubmitAnswerUseCase } from '@/domain/application/use-cases/Answer/submit-answer-use-case';
import { DatabaseModule } from '@/infra/database/database.module';
import { MessagingModule } from '@/infra/Messaging/messaging.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, MessagingModule],
  providers: [FetchAnswersUseCase, SubmitAnswerUseCase],
  exports: [FetchAnswersUseCase, SubmitAnswerUseCase],
})
export class AnswerModule {}
