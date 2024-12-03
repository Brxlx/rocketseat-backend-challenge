import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Challenge', { description: 'Challenge model' })
export class Challenge {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  // TODO: ADD relation to Answer

  @Field()
  createdAt!: string;
}
