import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { ProductResponseDTO } from './dto/product-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllProducts(): Promise<ProductResponseDTO<Product>> {
    const products = await this.productsService.getAllProducts();
    return new ProductResponseDTO<Product>(products, 0, '');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProductById(@Param('id') id: number): Promise<ProductResponseDTO<Product>> {
    const product = await this.productsService.getProductById(id);
    return new ProductResponseDTO<Product>(product ? [product] : [], 0, '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createProduct(@Body() productData: Partial<Product>): Promise<ProductResponseDTO<Product>> {
    const product = await this.productsService.createProduct(productData);
    return new ProductResponseDTO<Product>([product], 0, '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() productData: Partial<Product>,
  ): Promise<ProductResponseDTO<Product>> {
    const product = await this.productsService.updateProduct(id, productData);
    return new ProductResponseDTO<Product>(product ? [product] : [], 0, '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteProduct(@Param('id') id: number): Promise<ProductResponseDTO<Product>> {
    await this.productsService.deleteProduct(id);
    return new ProductResponseDTO<Product>([], 0, '');
  }
}
