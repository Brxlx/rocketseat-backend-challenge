import { FetchAnswersUseCase } from '@/domain/application/use-cases/Answer/fetch-answers-use.case';
import { SubmitAnswerUseCase } from '@/domain/application/use-cases/Answer/submit-answer-use-case';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  providers: [FetchAnswersUseCase, SubmitAnswerUseCase],
  exports: [FetchAnswersUseCase, SubmitAnswerUseCase],
})
export class AnswerModule {}
