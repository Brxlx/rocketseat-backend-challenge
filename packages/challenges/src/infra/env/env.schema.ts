import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod'] as const).default('dev'),
  APP_PORT: z.coerce.number().optional().default(3000),
  DB_DRIVER: z.enum(['postgresql']),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string().url(),
  KAFKA_BROKERS: z.string().url(),
  KAFKA_BASE_RETRY: z.coerce.number().optional().default(3),
  KAFKA_BASE_TIMEOUT: z.coerce.number().optional().default(30000),
  KAFKA_CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().optional().default(5),
});

export type Env = z.infer<typeof envSchema>;
