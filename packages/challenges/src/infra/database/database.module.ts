import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ChallengesRepository } from '@/domain/application/repositories/challenges.repository';
import { PrismaChallengesRepository } from './prisma/repositories/prisma-challenges.repository';
import { AnswersRepository } from '@/domain/application/repositories/answers.repository';
import { PrismaAnswersRepository } from './prisma/repositories/prisma-answers.repository';

@Module({
  imports: [],
  providers: [
    PrismaService,
    { provide: ChallengesRepository, useClass: PrismaChallengesRepository },
    { provide: AnswersRepository, useClass: PrismaAnswersRepository },
  ],
  exports: [PrismaService, ChallengesRepository, AnswersRepository],
})
export class DatabaseModule {}
