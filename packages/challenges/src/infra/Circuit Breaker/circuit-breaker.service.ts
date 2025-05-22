import {
  CircuitBreaker,
  CircuitBreakerGetState,
} from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CircuitBreakerService implements CircuitBreaker {
  private isOpen = false;
  private consecutiveFailures = 0;
  private lastFailureTime?: Date;

  constructor(private readonly threshold: number) {}

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
