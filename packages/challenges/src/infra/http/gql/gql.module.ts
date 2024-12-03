import { join } from 'node:path';

import { DatabaseModule } from '@/infra/database/database.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ChallengeResolver } from './resolvers/challenge.resolver';
import { ChallengeModule } from '../modules/Challenge/challenge.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      cache: 'bounded',
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      path: '/gql',
      autoSchemaFile: join(process.cwd(), 'src/infra/http/gql/schema.gql'),
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
    }),
    DatabaseModule,
    ChallengeModule,
  ],
  providers: [ChallengeResolver],
  exports: [ChallengeResolver],
})
export class GqlModule {}
