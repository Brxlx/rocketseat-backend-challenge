import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { ANSWER_STATUS } from '@/core/consts/index';

export interface AnswerProps {
  challengeId: UniqueEntityID;
  repositoryUrl: string;
  status: ANSWER_STATUS;
  grade?: number | null;
  createdAt: Date;
}

export class Answer extends Entity<AnswerProps> {
  get challengeId() {
    return this.props.challengeId;
  }

  get repositoryUrl() {
    return this.props.repositoryUrl;
  }

  get status() {
    return this.props.status;
  }

  set status(value: string) {
    this.status = value ?? ANSWER_STATUS.PENDING;
  }

  get grade() {
    return this.props.grade;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<AnswerProps, 'createdAt'>, id?: UniqueEntityID) {
    return new Answer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
