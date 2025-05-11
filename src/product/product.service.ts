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
      const {
        sku,
        name,
        description,
        categoryId,
        quantity,
        warehouseId,
      } = updateProductDto;

      // Ejecutamos todo dentro de una transacción
      const result = await this.dbService.$transaction(async (tx) => {
        // 1. Comprobar existencia del producto
        const existingProduct = await tx.product.findUnique({
          where: { id },
        });
        if (!existingProduct) {
          throw new BadRequestException(`Producto con ID ${id} no encontrado`);
        }

        // 2. Verificar SKU si cambió
        if (sku && sku !== existingProduct.sku) {
          const skuInUse = await tx.product.findUnique({
            where: { sku },
          });
          if (skuInUse) {
            throw new BadRequestException(`El SKU ${sku} ya está en uso`);
          }
        }

        // 3. Construir objeto de datos para el producto
        const dataToUpdate: Partial<{
          sku: string;
          name: string;
          description: string;
          categoryId: number;
        }> = {};
        if (sku !== undefined) dataToUpdate.sku = sku;
        if (name !== undefined) dataToUpdate.name = name;
        if (description !== undefined) dataToUpdate.description = description;
        if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;

        // 4. Actualizar producto si hay cambios
        let updatedProduct = existingProduct;
        if (Object.keys(dataToUpdate).length > 0) {
          updatedProduct = await tx.product.update({
            where: { id },
            data: dataToUpdate,
          });
        }

        // 5. Actualizar o crear stock si se proporcionan ambos campos
        if (warehouseId !== undefined && quantity !== undefined) {
          const existingStock = await tx.stock.findUnique({
            where: {
              productId_warehouseId: {
                productId: id,
                warehouseId,
              },
            },
          });

          if (existingStock) {
            await tx.stock.update({
              where: {
                productId_warehouseId: {
                  productId: id,
                  warehouseId,
                },
              },
              data: {
                quantity,
                updatedAt: new Date(),
              },
            });
          } else {
            await tx.stock.create({
              data: {
                productId: id,
                warehouseId,
                quantity,
              },
            });
          }
        }

        // 6. Devolver el producto actualizado
        return updatedProduct;
      });

      return result;
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
