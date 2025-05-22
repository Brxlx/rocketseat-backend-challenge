export abstract class StatusTransformer {
  abstract transform(externalStatus: string): string;
  abstract isValidStatus(status: string): boolean;
}
