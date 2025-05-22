export interface CircuitBreakerGetState {
  isOpen: boolean;
  consecutiveFailures: number;
  lastFailureTime?: Date;
}
export abstract class CircuitBreaker {
  abstract isCircuitOpen(): boolean;
  abstract recordFailure(): void;
  abstract recordSuccess(): void;
  abstract getState(): CircuitBreakerGetState;
}
