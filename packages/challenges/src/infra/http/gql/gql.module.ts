import { join } from 'node:path';

import { DatabaseModule } from '@/infra/database/database.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ChallengeModule } from './modules/Challenge/challenge.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLFormatErrorFilter } from '@/infra/filters/GqlFormatError.filter';
import { UUIDResolver } from './modules/Challenge/resolvers/uuid-scalar.resolver';
import { CreateChallengeResolver } from './modules/Challenge/resolvers/create-challenge.resolver';
import { SubmitAnswerResolver } from './modules/Answer/resolvers/submit-answer.resolver';
import { AnswerModule } from './modules/Answer/answer.module';
import { ListAnswersResolver } from './modules/Answer/resolvers/list-answers.resolver';
import { EditChallengeResolver } from './modules/Challenge/resolvers/edit-challenge.resolver';
import { DeleteChallengeResolver } from './modules/Challenge/resolvers/delete-challenge.resolver';
import { ListChallengesResolver } from './modules/Challenge/resolvers/list-challenges.resolver';
import { ResolverErrorInterceptor } from '@/infra/interceptors/resolver-error.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

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
        dateScalarMode: 'isoDate',
      },
      formatError: (formattedError) => new GraphQLFormatErrorFilter().format(formattedError),
    }),
    DatabaseModule,
    ChallengeModule,
    AnswerModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResolverErrorInterceptor,
    },
    UUIDResolver,
    CreateChallengeResolver,
    EditChallengeResolver,
    DeleteChallengeResolver,
    SubmitAnswerResolver,
    ListChallengesResolver,
    ListAnswersResolver,
  ],
  exports: [
    UUIDResolver,
    CreateChallengeResolver,
    EditChallengeResolver,
    DeleteChallengeResolver,
    SubmitAnswerResolver,
    ListChallengesResolver,
    ListAnswersResolver,
  ],
})
export class GqlModule {}
