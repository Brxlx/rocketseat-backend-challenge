import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CircuitBreaker } from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: CircuitBreaker,
      useClass: CircuitBreakerService,
    },
  ],
  exports: [CircuitBreaker],
})
export class CircuitBreakerModule {}
