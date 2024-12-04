import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Challenge', { description: 'Challenge model' })
export class Challenge {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  description!: string;

  @Field(() => Date)
  createdAt!: Date;
}
