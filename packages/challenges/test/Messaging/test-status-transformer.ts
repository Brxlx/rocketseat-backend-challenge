import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { StatusTransformer } from '@/domain/application/gateways/Messaging/status-transformer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestStatusTransformerService implements StatusTransformer {
  private readonly statusMap = new Map<string, ANSWER_STATUS>([
    ['Pending', ANSWER_STATUS.PENDING],
    ['Done', ANSWER_STATUS.DONE],
    ['Error', ANSWER_STATUS.ERROR],
  ]);

  private transformationHistory: Array<{ input: string; output: string }> = [];

  public transform(externalStatus: string): string {
    const internalStatus = this.statusMap.get(externalStatus) || ANSWER_STATUS.PENDING;

    // Registra a transformação para verificação nos testes
    this.transformationHistory.push({
      input: externalStatus,
      output: internalStatus,
    });

    return internalStatus;
  }

  public isValidStatus(status: string): boolean {
    return this.statusMap.has(status);
  }

  // Métodos auxiliares para testes
  public getTransformationHistory(): Array<{ input: string; output: string }> {
    return [...this.transformationHistory];
  }

  public clearHistory(): void {
    this.transformationHistory = [];
  }

  public addCustomMapping(external: string, internal: ANSWER_STATUS): void {
    this.statusMap.set(external, internal);
  }
}
