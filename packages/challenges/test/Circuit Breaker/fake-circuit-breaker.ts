import {
  CircuitBreaker,
  CircuitBreakerGetState,
} from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestCircuitBreakerService implements CircuitBreaker {
  private isOpen = false;
  private consecutiveFailures = 0;
  private lastFailureTime?: Date;

  public isCircuitOpen(): boolean {
    return this.isOpen;
  }

  public recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = new Date();
  }

  public recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.isOpen = false;
    this.lastFailureTime = undefined;
  }

  public getState(): CircuitBreakerGetState {
    return {
      isOpen: this.isOpen,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
    };
  }

  // Métodos auxiliares para testes
  public forceOpen(): void {
    this.isOpen = true;
  }

  public forceClose(): void {
    this.isOpen = false;
    this.consecutiveFailures = 0;
    this.lastFailureTime = undefined;
  }

  public setConsecutiveFailures(count: number): void {
    this.consecutiveFailures = count;
  }
}
