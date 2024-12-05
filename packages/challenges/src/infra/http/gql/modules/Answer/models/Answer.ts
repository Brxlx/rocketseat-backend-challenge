import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GQL_ANSWER_STATUS_ENUM } from '../resolvers/register-answer-enum';

@ObjectType('Answer', { description: 'Answer model' })
export class Answer {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  challengeId!: string;

  @Field(() => String)
  repositoryUrl!: string;

  @Field(() => GQL_ANSWER_STATUS_ENUM)
  status!: typeof GQL_ANSWER_STATUS_ENUM;

  @Field(() => Int, { nullable: true })
  grade?: number;

  @Field(() => Date)
  createdAt!: Date;
}
