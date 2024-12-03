import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ChallengesRepository } from '@/domain/application/repositories/challenges.repository';
import { PrismaChallengesRepository } from './prisma/repositories/prisma-challenges.repository';

@Module({
  imports: [],
  providers: [
    PrismaService,
    { provide: ChallengesRepository, useClass: PrismaChallengesRepository },
  ],
  exports: [PrismaService, ChallengesRepository],
})
export class DatabaseModule {}
