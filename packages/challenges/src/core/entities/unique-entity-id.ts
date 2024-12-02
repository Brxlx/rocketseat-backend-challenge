import { randomUUID } from 'node:crypto';

export class UniqueEntityID {
  private value: string;

  toString() {
    return this.value;
  }

  toValue() {
    return this.value;
  }

  private generateId(): string {
    return randomUUID();
  }

  constructor(value?: string) {
    this.value = value ?? this.generateId();
  }

  public equals(id: UniqueEntityID): boolean {
    return id.toValue() === this.value;
  }

  public isValid(): boolean {
    // Expressão regular para validar UUID v4
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidV4Regex.test(this.value);
  }
}
