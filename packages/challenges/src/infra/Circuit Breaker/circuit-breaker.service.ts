import {
  CircuitBreaker,
  CircuitBreakerGetState,
} from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '../env/env.service';

@Injectable()
export class CircuitBreakerService implements CircuitBreaker {
  private isOpen = false;
  private consecutiveFailures = 0;
  private lastFailureTime?: Date;
  private readonly threshold: number;

  constructor(private readonly envService: EnvService) {
    this.threshold = this.envService.get('KAFKA_CIRCUIT_BREAKER_THRESHOLD');
  }

  public isCircuitOpen(): boolean {
    return this.isOpen;
  }

  public recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = new Date();

    if (this.consecutiveFailures >= this.threshold) {
      this.isOpen = true;
      Logger.warn(
        `Circuit breaker aberto após ${this.consecutiveFailures} falhas consecutivas`,
        CircuitBreakerService.name,
      );
    }
  }

  public recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.isOpen = false;
    this.lastFailureTime = undefined;
  }

  getState(): CircuitBreakerGetState {
    return {
      isOpen: this.isOpen,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
