import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ListChallengesFiltersInput {
  @Field({ nullable: true })
  titleOrDescription?: string;

  @Field({ nullable: true, defaultValue: 1 })
  page?: number;

  @Field({ nullable: true, defaultValue: 10 })
  itemsPerPage?: number;
}
