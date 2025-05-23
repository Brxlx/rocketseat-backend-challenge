import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export interface ChallengeProps {
  title: string;
  description: string;
  createdAt: Date;
}

export class Challenge extends Entity<ChallengeProps> {
  get title() {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
  }

  get description() {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<ChallengeProps, 'createdAt'>, id?: UniqueEntityID) {
    return new Challenge(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
