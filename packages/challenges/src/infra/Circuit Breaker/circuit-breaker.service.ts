import {
  CircuitBreaker,
  CircuitBreakerGetState,
} from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';
import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '../env/env.service';

export interface CircuitBreakerState {
  isOpen: boolean;
  consecutiveFailures: number;
  lastFailureTime?: Date;
}

@Injectable()
export class CircuitBreakerService implements CircuitBreaker {
  private state: CircuitBreakerState;
  private readonly threshold: number;

  constructor(private readonly envService: EnvService) {
    this.threshold = this.envService.get('KAFKA_CIRCUIT_BREAKER_THRESHOLD') || 3;
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

    // Log para debug
    // console.log(
    //   `Falhas: ${this.state.consecutiveFailures}, Threshold: ${this.threshold}, Condição: ${this.state.consecutiveFailures >= this.threshold}`,
    // );

    if (this.state.consecutiveFailures >= this.threshold) {
      this.state.isOpen = true;
      Logger.warn(
        `Circuit breaker aberto após ${this.state.consecutiveFailures} falhas consecutivas`,
        CircuitBreakerService.name,
      );
    }
  }

  public recordSuccess(): void {
    this.state.consecutiveFailures = 0;
    this.state.isOpen = false;
    this.state.lastFailureTime = undefined;
  }

  getState(): CircuitBreakerGetState {
    return {
      isOpen: this.state.isOpen,
      consecutiveFailures: this.state.consecutiveFailures,
      lastFailureTime: this.state.lastFailureTime,
    };
  }
}
