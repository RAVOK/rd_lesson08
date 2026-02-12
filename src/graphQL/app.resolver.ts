import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { description: 'Простий тестовий GraphQL-запит' })
  hello(): string {
    return 'Hello from GraphQL!';
  }
}

