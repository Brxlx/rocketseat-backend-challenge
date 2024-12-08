import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class DeleteChallengeInput {
  @Field(() => ID)
  id!: string;
}
