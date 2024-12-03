import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  providers: [CreateChallengeUseCase],
  exports: [CreateChallengeUseCase],
})
export class ChallengeModule {}
