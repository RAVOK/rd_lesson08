import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppDataSource } from '../database/data-source';
import { Product } from '../products/products.entity';
import { createProductLoader } from '../loaders/product.loader';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      debug: false, // вимикає включення stacktrace в помилку
      formatError: (error) => {
        // логування стека залишається на сервері (Logger.error в сервісах)
        return {
          message: error.message,
          extensions: {
            code: error.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
          },
        };
      },
      context: ({ req }) => {
        const productRepo = AppDataSource.getRepository(Product);
        return {
          req,
          loaders: {
            productLoader: createProductLoader(productRepo),
          },
        };
      },
    }),
  ],
})
export class GraphqlModule {}