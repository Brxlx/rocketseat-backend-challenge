import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { StatusTransformer } from '@/domain/application/gateways/Messaging/status-transformer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StatusTransformerService implements StatusTransformer {
  private readonly statusMap = new Map<string, ANSWER_STATUS>([
    ['Pending', ANSWER_STATUS.PENDING],
    ['Done', ANSWER_STATUS.DONE],
    ['Error', ANSWER_STATUS.ERROR],
  ]);

  /**
   * Transforma status externo para status interno do sistema
   * @param externalStatus - Status recebido do serviço externo
   * @returns Status interno correspondente
   */
  public transform(externalStatus: string): string {
    const internalStatus = this.statusMap.get(externalStatus);

    if (!internalStatus) {
      // Log warning para status desconhecidos para monitoramento
      Logger.warn(`Status desconhecido recebido: ${externalStatus}`, StatusTransformer.name);
      return ANSWER_STATUS.PENDING;
    }

    return internalStatus;
  }

  /**
   * Valida se o status é válido
   * @param status - Status a ser validado
   * @returns true se o status é válido
   */
  public isValidStatus(status: string): boolean {
    return this.statusMap.has(status);
  }
}
