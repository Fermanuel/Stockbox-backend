import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DbService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {

  // logger: Logger = new Logger(ProductService.name);
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly dbService: DbService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const { name, sku, description, categoryId, quantity, warehouseId } = createProductDto;

      // Verificar si el SKU ya existe
      const existingProduct = await this.dbService.product.findUnique({
        where: { sku },
      });

      if (existingProduct) {
        throw new BadRequestException(`El SKU ${sku} ya está en uso`);
      }

      // Crear el producto y su stock asociado en una transacción
      const result = await this.dbService.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name,
            sku,
            description,
            categoryId,
          },
        });

        const stock = await tx.stock.create({
          data: {
            productId: product.id,
            warehouseId,
            quantity,
          },
        });

        return { ...product, stock };
      });

      return result;
    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async findAll() {
    try {
      const products = await this.dbService.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { name: true },
          },
          stocks: {
            select: {
              quantity: true,
              warehouse: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!products || products.length === 0) {
        throw new BadRequestException(`No se encontraron productos`);
      }

      // Aplanar completamente los datos
      const flattenedProducts = products.flatMap((product) =>
        product.stocks.map((stock) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          categoryName: product.category?.name || null,
          warehouseName: stock.warehouse.name,
          quantity: stock.quantity,
        }))
      );

      return flattenedProducts;
    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async findOne(id: number) {

    try {
      const products = await this.dbService.product.findMany({
        where: { id, isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { name: true },
          },
          stocks: {
            select: {
              quantity: true,
              warehouse: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!products || products.length === 0) {
        throw new BadRequestException(`No se encontraron productos`);
      }

      // Aplanar completamente los datos
      const flattenedProducts = products.flatMap((product) =>
        product.stocks.map((stock) => ({
          id: product.id,
          sku: product.sku,
          name: product.name,
          description: product.description,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          categoryName: product.category?.name || null,
          warehouseName: stock.warehouse.name,
          quantity: stock.quantity,
        }))
      );

      return flattenedProducts;
    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const { sku, name, description, categoryId, quantity, warehouseId } = updateProductDto;

      const updatedProduct = await this.dbService.$transaction(async (tx) => {
        
        // 1) Buscar por ID, no por SKU:
        const existingProduct = await tx.product.findUnique({
          where: { id },
        });
        if (!existingProduct) {
          throw new BadRequestException(`Producto con ID ${id} no encontrado`);
        }

        // 2) Sólo verificar SKU si viene definido y cambió:
        if (sku !== undefined && sku !== existingProduct.sku) {
          const skuInUse = await tx.product.findUnique({
            where: { sku },
          });
          if (skuInUse) {
            throw new BadRequestException(`El SKU ${sku} ya está en uso`);
          }
        }

        // 3) Preparar datos de producto:
        const productData: Prisma.ProductUpdateInput = {};

        if (sku !== undefined) productData.sku = sku;
        if (name !== undefined) productData.name = name;
        if (description !== undefined) productData.description = description;
        if (categoryId !== undefined) productData.category = { connect: { id: categoryId } };

        // 4) Upsert de stock (si vienen ambos campos):
        if (warehouseId !== undefined && quantity !== undefined) {
          productData.stocks = {
            upsert: {
              where: {
                productId_warehouseId: { productId: id, warehouseId },
              },
              update: {
                quantity,
                updatedAt: new Date(),
              },
              create: {
                warehouse: { connect: { id: warehouseId } },
                quantity,
              },
            },
          };
        }

        // 5) Ejecutar update e incluir stocks:
        return tx.product.update({
          where: { id },
          data: productData,
          include: { stocks: true },
        });
      });

      return updatedProduct;

    } catch (error) {
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
