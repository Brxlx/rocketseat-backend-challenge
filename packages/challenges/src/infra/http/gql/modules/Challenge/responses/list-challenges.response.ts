import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Challenge } from '../models/Challenge';

@ObjectType()
export class ListChallengesResponse {
  @Field(() => [Challenge])
  challenges!: Challenge[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  itemsPerPage!: number;
}
