import { Field, InputType } from '@nestjs/graphql';
import { FiltersInput } from './filters.input';
import { ParamsInput } from './params.input';

@InputType()
export class ListAnswersInput {
  @Field(() => FiltersInput, { nullable: true })
  filters?: FiltersInput;

  @Field(() => ParamsInput, { nullable: true })
  params?: ParamsInput;
}
