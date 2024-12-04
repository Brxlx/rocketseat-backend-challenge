import { Field, ObjectType } from '@nestjs/graphql';
import { Challenge } from '../models/Challenge';

@ObjectType()
export class EditChallengeResponse {
  @Field(() => Challenge)
  challenge!: Challenge;
}
