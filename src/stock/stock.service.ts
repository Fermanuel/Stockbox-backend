import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class StockService {

  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly dbService: DbService,
  ) { }

  async createTrasferStock(dto: CreateStockDto) {

    try {

      const { fromWarehouse, toWarehouse, userId, notes, details } = dto;

      return await this.dbService.$transaction(async (tx) => {
        // 1. Crear encabezado de la transferencia
        const transfer = await tx.transfer.create({
          data: { fromWarehouse, toWarehouse, userId, notes },
        });

        // 2. Procesar cada línea de detalle
        for (const item of details) {
          const { productId, quantity } = item;

          if (quantity <= 0) {
            throw new BadRequestException('La cantidad debe ser mayor que cero');
          }

          // 2.1. Obtener stock origen
          const stockFrom = await tx.stock.findUnique({
            where: { productId_warehouseId: { productId, warehouseId: fromWarehouse } },
          });
          if (!stockFrom || stockFrom.quantity < quantity) {
            throw new BadRequestException(`Stock insuficiente para producto ${productId}`);
          }

          // 2.2. Actualizar stock en origen
          await tx.stock.update({
            where: { id: stockFrom.id },
            data: { quantity: stockFrom.quantity - quantity, updatedAt: new Date() },
          });
          // Registrar auditoría negativa
          await tx.stockAudit.create({
            data: {
              stockId: stockFrom.id,
              change: -quantity,
              transferId: transfer.id,
              userId,
              reason: 'TRANSFER_OUT',
            },
          });

          // 2.3. Obtener o crear stock en destino
          let stockTo = await tx.stock.findUnique({
            where: { productId_warehouseId: { productId, warehouseId: toWarehouse } },
          });
          if (!stockTo) {
            stockTo = await tx.stock.create({
              data: {
                productId,
                warehouseId: toWarehouse,
                quantity: 0,
              },
            });
          }
          // Actualizar stock en destino
          await tx.stock.update({
            where: { id: stockTo.id },
            data: { quantity: stockTo.quantity + quantity, updatedAt: new Date() },
          });
          // Registrar auditoría positiva
          await tx.stockAudit.create({
            data: {
              stockId: stockTo.id,
              change: +quantity,
              transferId: transfer.id,
              userId,
              reason: 'TRANSFER_IN',
            },
          });

          // 2.4. Crear detalle de transferencia
          await tx.transferDetail.create({
            data: {
              transferId: transfer.id,
              productId,
              quantity,
            },
          });
        }

        // 3. Al terminar, devolver la transferencia con sus detalles
        return tx.transfer.findUnique({
          where: { id: transfer.id },
          include: {
            details: { include: { product: true } },
            from: true,
            to: true,
            user: true,
          },
        });
      });

    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all stock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stock`;
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
