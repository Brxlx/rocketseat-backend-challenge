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

  set status(value: ANSWER_STATUS) {
    this.props.status = value ?? ANSWER_STATUS.PENDING;
  }

  get grade() {
    return this.props.grade;
  }

  set grade(value: number | null | undefined) {
    this.props.grade = value ?? null;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<AnswerProps, 'status' | 'createdAt'>, id?: UniqueEntityID) {
    return new Answer(
      {
        ...props,
        status: props.status ?? ANSWER_STATUS.PENDING,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
