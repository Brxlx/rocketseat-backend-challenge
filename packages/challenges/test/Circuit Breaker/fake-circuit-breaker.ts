import {
  CircuitBreaker,
  CircuitBreakerGetState,
} from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { CircuitBreakerState } from '@/infra/Circuit Breaker/circuit-breaker.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestCircuitBreakerService implements CircuitBreaker {
  private state: CircuitBreakerState;

  constructor() {
    this.state = {
      isOpen: false,
      consecutiveFailures: 0,
      lastFailureTime: undefined,
    };
  }

  public isCircuitOpen(): boolean {
    return this.state.isOpen;
  }

  public recordFailure(): void {
    this.state.consecutiveFailures++;
    this.state.lastFailureTime = new Date();
  }

  public recordSuccess(): void {
    this.state.consecutiveFailures = 0;
    this.state.isOpen = false;
    this.state.lastFailureTime = undefined;
  }

  public getState(): CircuitBreakerGetState {
    return {
      isOpen: this.state.isOpen,
      consecutiveFailures: this.state.consecutiveFailures,
      lastFailureTime: this.state.lastFailureTime,
    };
  }

  // Métodos auxiliares para testes
  public forceOpen(): void {
    this.state.isOpen = true;
  }

  public forceClose(): void {
    this.state.isOpen = false;
    this.state.consecutiveFailures = 0;
    this.state.lastFailureTime = undefined;
  }

  public setConsecutiveFailures(count: number): void {
    this.state.consecutiveFailures = count;
  }
}
