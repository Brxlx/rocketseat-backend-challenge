import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Answer } from '../models/Answer';

@ObjectType()
export class ListAnswersResponse {
  @Field(() => [Answer])
  answers!: Answer[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  itemsPerPage!: number;
}
