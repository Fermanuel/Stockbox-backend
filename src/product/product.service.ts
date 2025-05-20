import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DbService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {

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
        throw new BadRequestException(`This SKU already exists`);
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
    const products = await this.dbService.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        stocks: {
          select: {
            id: true,
            quantity: true,
            warehouse: { select: { name: true } },
          },
        },
      },
    });

    // Aplanamos y usamos stock.id como id único
    const flattened = products.flatMap(product =>
      product.stocks.map(stock => ({
        id: stock.id,
        productId: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        categoryName: product.category?.name ?? null,
        warehouseName: stock.warehouse.name,
        quantity: stock.quantity,
      }))
    );

    return flattened;
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
        throw new BadRequestException(`Product not found`);
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

  async update(id: number, dto: UpdateProductDto) {
    try {

      const { sku, name, description, categoryId, quantity, warehouseId } = dto;

      if (quantity !== undefined && warehouseId === undefined) {
        throw new BadRequestException(
          'Defines product warehouse when you update the quantity',
        );
      }

      // 1) Realiza la transacción
      const raw = await this.dbService.$transaction(async tx => {

        // a) Verifica existencia y SKU idéntico al ejemplo anterior...
        const existing = await tx.product.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException(`Producto ${id} no existe`);
        if (sku !== undefined && sku !== existing.sku) {
          const inUse = await tx.product.findUnique({ where: { sku } });
          if (inUse) throw new BadRequestException(`SKU ${sku} en uso`);
        }

        // b) Construye productData igual que antes, incluyendo upsert de stock
        const productData: Prisma.ProductUpdateInput = {};

        if (sku !== undefined) productData.sku = sku;
        if (name !== undefined) productData.name = name;
        if (description !== undefined) productData.description = description;
        if (categoryId !== undefined) productData.category = { connect: { id: categoryId } };

        if (warehouseId !== undefined && quantity !== undefined) {
          productData.stocks = {
            upsert: {
              where: { productId_warehouseId: { productId: id, warehouseId } },
              update: { quantity, updatedAt: new Date() },
              create: { warehouse: { connect: { id: warehouseId } }, quantity },
            }
          };
        }

        // c) Ejecuta update con select
        return tx.product.update({
          where: { id },
          data: productData,
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            category: {
              select: { name: true }
            },
            stocks: {
              where: { warehouseId },
              select: {
                quantity: true,
                warehouse: { select: { name: true } }
              }
            }
          }
        });
      });

      // 2) Aplana
      const stockEntry = (raw.stocks && raw.stocks[0]) || { quantity: null, warehouse: { name: null } };

      return {
        id: raw.id,
        sku: raw.sku,
        name: raw.name,
        description: raw.description,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        categoryName: raw.category?.name ?? null,
        warehouseName: stockEntry.warehouse.name,
        quantity: stockEntry.quantity,
      };
    } catch (error) {
      this.logger.error(error);
      this.handleDBError(error);
    }
  }

  // TODO: Cambiar a soft delete ya que se debe de elimar de una alamacen en específico
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
