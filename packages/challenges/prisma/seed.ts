import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createData() {
  const challengeId: string = randomUUID();

  console.log('---Seeding db with wallets---');

  const createChallenge = prisma.challenge.create({
    data: {
      id: challengeId,
      title: 'Desafio 1',
      description: 'Desafio 1',
    },
  });

  const createAnswer1 = prisma.answer.create({
    data: {
      challengeId: challengeId,
      repositoryUrl: 'https://github.com/usr/challenge-1',
      status: 'PENDING',
    },
  });

  const createAnswer2 = prisma.answer.create({
    data: {
      challengeId: challengeId,
      repositoryUrl: 'https://github.com/usr/challenge-2',
      status: 'DONE',
    },
  });

  const createAnswer3 = prisma.answer.create({
    data: {
      challengeId: challengeId,
      repositoryUrl: 'https://githubo.com/usr/challenge-3',
      status: 'ERROR',
    },
  });

  try {
    await prisma.$transaction([createChallenge, createAnswer1, createAnswer2, createAnswer3]);
    console.log('---Finished seeding db---');
  } catch (err: any) {
    if (err.code === 'P2002') {
      throw new Error('Challenge already exists');
    }
    throw new Error('Some constraint or DB error, check database');
  }
}

async function run() {
  await createData();
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
