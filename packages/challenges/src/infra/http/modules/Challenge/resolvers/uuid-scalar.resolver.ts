import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Scalar } from '@nestjs/graphql';
import { GraphQLScalarType, Kind } from 'graphql';

export const UUID = new GraphQLScalarType({
  name: 'UUID',
  description: 'A custom UUID scalar type',

  serialize(value) {
    if (typeof value === 'string') {
      if (new UniqueEntityID(value).isValid()) {
        return value;
      }
      throw new Error('Invalid UUID');
    }

    if (value && typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (new UniqueEntityID(stringValue).isValid()) {
        return stringValue;
      }
    }

    throw new Error('Invalid UUID');
  },

  parseValue(value) {
    if (typeof value === 'string' && new UniqueEntityID(value).isValid()) {
      return value;
    }
    throw new Error('Invalid UUID');
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      if (new UniqueEntityID(ast.value).isValid()) {
        return ast.value;
      }
    }
    throw new Error('Invalid UUID');
  },
});

@Scalar('UUID')
export class UUIDResolver {
  description = 'Custom UUID scalar type';

  parseValue = (value: any) => UUID.parseValue(value);

  serialize = (value: any) => UUID.serialize(value);

  parseLiteral = (ast: any) => UUID.parseLiteral(ast);
}
