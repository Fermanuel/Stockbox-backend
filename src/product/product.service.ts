import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class ProductService {

  // logger: Logger = new Logger(ProductService.name);
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly dbService: DbService,
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {
      const { name, sku, description, categoryId } = createProductDto;

      // Verificar si el SKU ya existe
      const existingProduct = await this.dbService.product.findUnique({
        where: { sku },
      });

      if (existingProduct) {
        throw new BadRequestException(`El SKU ${sku} ya está en uso`);
      }

      // Crear el nuevo producto
      const product = await this.dbService.product.create({
        data: {
          name,
          sku,
          description,
          categoryId,
        },
      });

      return product;
    }
    catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async findAll() {

    try {

      const products = await this.dbService.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!products) {
        throw new BadRequestException(`No se encontraron productos`);
      }
      return products;
    }
    catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async findOne(id: number) {

    try {
      const product = await this.dbService.product.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          sku: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              name: true,
            },
          },
        }
      });

      if (!product) {
        throw new BadRequestException(`Product not found`);
      }

      return product;
    }
    catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const { name, sku, description, categoryId } = updateProductDto;

      // Verificar si el SKU ya existe
      const existingProduct = await this.dbService.product.findUnique({
        where: { sku },
      });

      if (existingProduct) {
        throw new BadRequestException(`El SKU ${sku} ya está en uso`);
      }

      // Actualizar el producto
      const product = await this.dbService.product.update({
        where: { id },
        data: {
          name,
          sku,
          description,
          categoryId,
        },
      });

      if (!product) {
        throw new BadRequestException(`Product not found`);
      }

      return product;
    }
    catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async remove(id: number) {
    try {
      const product = await this.dbService.product.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      if (!product) {
        throw new BadRequestException(`Product not found`);
      }

      return product;
    }
    catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any): never {

    if (error instanceof BadRequestException) {
      // Ya es una excepción con código 400
      throw error;
    }

    if (error.code === '23505') {
      // Violación de unicidad → 400 Bad Request
      throw new BadRequestException(error.detail);
    }

    // Cualquier otro error → 500 Internal Server Error
    throw new InternalServerErrorException('Error en la base de datos');
  }
}
