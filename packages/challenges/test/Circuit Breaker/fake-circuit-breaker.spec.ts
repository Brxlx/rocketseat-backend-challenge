import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from '@/infra/Circuit Breaker/circuit-breaker.service';
import { EnvService } from '@/infra/env/env.service';
import { Logger } from '@nestjs/common';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let envService: EnvService;

  const mockEnvService = {
    get: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerService,
        {
          provide: EnvService,
          useValue: mockEnvService,
        },
      ],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    envService = module.get<EnvService>(EnvService);

    // Mock do threshold padrão
    mockEnvService.get.mockReturnValue(3);

    // Mock do Logger para evitar logs durante os testes
    vi.spyOn(Logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with closed circuit breaker ', () => {
      expect(service.isCircuitOpen()).toBe(false);
    });

    it('should boot with zero consecutive failures', () => {
      const state = service.getState();
      expect(state.consecutiveFailures).toBe(0);
    });

    it('should boot without last failure time', () => {
      const state = service.getState();
      expect(state.lastFailureTime).toBeUndefined();
    });

    it('should be abke to configure the threshold from EnvService', () => {
      expect(mockEnvService.get).toHaveBeenCalledWith('KAFKA_CIRCUIT_BREAKER_THRESHOLD');
    });
  });

  describe('recordFailure()', () => {
    it('should increment the consecutive failures counter', () => {
      service.recordFailure();

      const state = service.getState();
      expect(state.consecutiveFailures).toBe(1);
    });

    it('should record the time of the last failure', () => {
      const beforeFailure = new Date();
      service.recordFailure();
      const afterFailure = new Date();

      const state = service.getState();
      expect(state.lastFailureTime).toBeDefined();
      expect(state.lastFailureTime!.getTime()).toBeGreaterThanOrEqual(beforeFailure.getTime());
      expect(state.lastFailureTime!.getTime()).toBeLessThanOrEqual(afterFailure.getTime());
    });

    it('should keep the circuit breaker closed when faults are smaller than the threshold', () => {
      service.recordFailure();
      service.recordFailure();

      expect(service.isCircuitOpen()).toBe(false);
    });

    it('should open the circuit breaker when faults reach the threshold', () => {
      // Threshold padrão é 3
      service.recordFailure();
      service.recordFailure();
      service.recordFailure();

      expect(service.isCircuitOpen()).toBe(true);
    });

    it('should log warning when circuit breaker is opened', () => {
      const loggerSpy = vi.spyOn(Logger, 'warn');

      service.recordFailure();
      service.recordFailure();
      service.recordFailure();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Circuit breaker aberto após 3 falhas consecutivas',
        'CircuitBreakerService',
      );
    });

    it('should continue to increment faults even with circuit breaker open', () => {
      // Abrir o circuit breaker
      service.recordFailure();
      service.recordFailure();
      service.recordFailure();

      // Adicionar mais uma falha
      service.recordFailure();

      const state = service.getState();
      expect(state.consecutiveFailures).toBe(4);
      expect(service.isCircuitOpen()).toBe(true);
    });
  });

  describe('recordSuccess()', () => {
    it('should reset the consecutive failures counter', () => {
      service.recordFailure();
      service.recordFailure();
      service.recordSuccess();

      const state = service.getState();
      expect(state.consecutiveFailures).toBe(0);
    });

    it('should close the circuit breaker', () => {
      // Abrir o circuit breaker
      service.recordFailure();
      service.recordFailure();
      service.recordFailure();

      expect(service.isCircuitOpen()).toBe(true);

      service.recordSuccess();

      expect(service.isCircuitOpen()).toBe(false);
    });

    it('should clear the time of the last failure', () => {
      service.recordFailure();
      service.recordSuccess();

      const state = service.getState();
      expect(state.lastFailureTime).toBeUndefined();
    });

    it('should work even when circuit breaker is already closed', () => {
      service.recordSuccess();

      const state = service.getState();
      expect(state.consecutiveFailures).toBe(0);
      expect(service.isCircuitOpen()).toBe(false);
      expect(state.lastFailureTime).toBeUndefined();
    });
  });

  describe('getState()', () => {
    it('should return the correct initial state', () => {
      const state = service.getState();

      expect(state).toEqual({
        isOpen: false,
        consecutiveFailures: 0,
        lastFailureTime: undefined,
      });
    });

    it('should return state after failures', () => {
      service.recordFailure();
      service.recordFailure();

      const state = service.getState();

      expect(state.isOpen).toBe(false);
      expect(state.consecutiveFailures).toBe(2);
      expect(state.lastFailureTime).toBeDefined();
    });

    it('should return the state with circuit breaker open', () => {
      service.recordFailure();
      service.recordFailure();
      service.recordFailure();

      const state = service.getState();

      expect(state.isOpen).toBe(true);
      expect(state.consecutiveFailures).toBe(3);
      expect(state.lastFailureTime).toBeDefined();
    });
  });

  describe('Custom threshold scenarios', () => {
    beforeEach(() => {
      // Configurar threshold customizado
      mockEnvService.get.mockReturnValue(5);
    });

    it('should use environment custom threshold', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CircuitBreakerService,
          {
            provide: EnvService,
            useValue: mockEnvService,
          },
        ],
      }).compile();

      const customService = module.get<CircuitBreakerService>(CircuitBreakerService);

      // Deve permanecer fechado até atingir 5 falhas
      customService.recordFailure();
      customService.recordFailure();
      customService.recordFailure();
      customService.recordFailure();

      expect(customService.isCircuitOpen()).toBe(false);

      customService.recordFailure(); // 5ª falha

      expect(customService.isCircuitOpen()).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should switch between states correctly', () => {
      // Estado inicial
      expect(service.isCircuitOpen()).toBe(false);

      // Causar falhas até abrir
      service.recordFailure();
      service.recordFailure();
      service.recordFailure();

      expect(service.isCircuitOpen()).toBe(true);

      // Registrar sucesso para fechar
      service.recordSuccess();

      expect(service.isCircuitOpen()).toBe(false);
      expect(service.getState().consecutiveFailures).toBe(0);
    });

    it('should keep a time history of failures', () => {
      const firstFailureTime = new Date();
      service.recordFailure();
      expect(service.getState().lastFailureTime).toBeDefined();
      expect(service.getState().lastFailureTime!.getTime()).toBeGreaterThanOrEqual(
        firstFailureTime.getTime() - 100,
      );

      // Simular delay
      vi.useFakeTimers().advanceTimersByTime(1000);

      const secondFailureTime = new Date();
      service.recordFailure();

      const state = service.getState();
      expect(state.lastFailureTime!.getTime()).toBeGreaterThanOrEqual(
        secondFailureTime.getTime() - 100,
      );
    });
  });
});
