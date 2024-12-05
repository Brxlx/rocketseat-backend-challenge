import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ParamsInput {
  @Field(() => Number, { nullable: true })
  page?: number;

  @Field(() => Number, { nullable: true })
  itemsPerPage?: number;
}
