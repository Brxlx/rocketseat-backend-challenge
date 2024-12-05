import { Field, InputType } from '@nestjs/graphql';
import { GQL_ANSWER_STATUS_ENUM } from '../resolvers/register-answer-enum';

@InputType()
export class FiltersInput {
  @Field(() => String, { nullable: true })
  challengeId?: string;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => GQL_ANSWER_STATUS_ENUM, { nullable: true })
  status?: GQL_ANSWER_STATUS_ENUM;
}
