import { join } from 'node:path';

import { DatabaseModule } from '@/infra/database/database.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ChallengeModule } from './modules/Challenge/challenge.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLFormatErrorFilter } from '@/infra/filters/GqlFormatError.filter';
import { UUIDResolver } from './modules/Challenge/resolvers/uuid-scalar.resolver';
import { ChallengeResolver } from './modules/Challenge/resolvers/challenge.resolver';

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
      resolvers: {
        // UUID: {
        //   __resolveType: () => null,
        //   // Outras configurações se necessário
        //   parseValue: new UUIDResolver().parseValue,
        //   serialize: new UUIDResolver().serialize,
        //   parseLiteral: new UUIDResolver().parseLiteral,
        // },
      },
      formatError: (formattedError) => new GraphQLFormatErrorFilter().format(formattedError),
    }),
    DatabaseModule,
    ChallengeModule,
  ],
  providers: [UUIDResolver, ChallengeResolver],
  exports: [UUIDResolver, ChallengeResolver],
})
export class GqlModule {}
