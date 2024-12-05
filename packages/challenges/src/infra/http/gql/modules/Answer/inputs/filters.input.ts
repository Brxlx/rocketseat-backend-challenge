import { ANSWER_STATUS } from '@/core/consts';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersInput {
  @Field(() => String, { nullable: true })
  challengeId?: string;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  status?: ANSWER_STATUS;
}
