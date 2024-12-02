import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { EnvService } from './env/env.service';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);

  const port = app.get(EnvService).get('APP_PORT');

  await app.listen(port ?? 3000, () => {
    logger.log(`Server is running on port ${port}`);
  });
}
bootstrap();
