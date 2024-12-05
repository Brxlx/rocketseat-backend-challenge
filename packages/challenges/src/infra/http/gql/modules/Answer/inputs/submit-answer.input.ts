import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SubmitAnswerInput {
  @Field(() => String)
  challengeId!: string;

  @Field(() => String)
  repositoryUrl!: string;
}
