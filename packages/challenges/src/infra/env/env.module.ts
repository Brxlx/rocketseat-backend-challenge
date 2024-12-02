import { CoreEnv } from '@/core/env/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { EnvService } from './env.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
      cache: true,
    }),
  ],
  providers: [{ provide: CoreEnv, useClass: EnvService }, EnvService],
  exports: [CoreEnv, EnvService],
})
export class EnvModule {}
