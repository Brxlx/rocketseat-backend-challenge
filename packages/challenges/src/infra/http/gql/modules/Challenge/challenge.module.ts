import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { EditChallengeUseCase } from '@/domain/application/use-cases/Challenge/edit-challenge-use-case';
import { ListChallengesUseCase } from '@/domain/application/use-cases/Challenge/list-challenges-use-case';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  providers: [
    CreateChallengeUseCase,
    ListChallengesUseCase,
    EditChallengeUseCase,
    DeleteChallengeUseCase,
  ],
  exports: [
    CreateChallengeUseCase,
    ListChallengesUseCase,
    EditChallengeUseCase,
    DeleteChallengeUseCase,
  ],
})
export class ChallengeModule {}
