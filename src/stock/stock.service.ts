import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { DbService } from 'src/db/db.service';
import { WithdrawStockDto } from './dto/withdrawStock.dto';

@Injectable()
export class StockService {

  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly dbService: DbService,
  ) { }

  async createTrasferStock(dto: CreateStockDto) {
    const { fromWarehouse, toWarehouse, userId, notes, details } = dto;

    if (fromWarehouse === toWarehouse) {
      throw new BadRequestException('El almacén de origen y destino no pueden ser el mismo');
    }

    return this.dbService.$transaction(async (tx) => {
      // 1. Crear encabezado de la transferencia
      const transfer = await tx.transfer.create({
        data: { fromWarehouse, toWarehouse, userId, notes },
      });

      // 2. Procesar cada línea de detalle
      for (const item of details) {
        const { stockId, quantity } = item;

        if (quantity <= 0) {
          throw new BadRequestException('La cantidad debe ser mayor que cero');
        }

        // 2.1. Obtener registro de stock origen
        const stockFrom = await tx.stock.findUnique({
          where: { id: stockId },
          select: { id: true, productId: true, warehouseId: true, quantity: true },
        });

        if (!stockFrom || stockFrom.warehouseId !== fromWarehouse) {
          throw new BadRequestException(`Stock ${stockId} no encontrado en el almacén de origen`);
        }

        if (stockFrom.quantity < quantity) {
          throw new BadRequestException(`Stock insuficiente (ID ${stockId})`);
        }

        // 2.2. Actualizar stock en origen
        await tx.stock.update({
          where: { id: stockId },
          data: {
            quantity: { decrement: quantity },
            updatedAt: new Date(),
          },
        });

        // Auditoría negativa
        await tx.stockAudit.create({
          data: {
            stockId,
            change: -quantity,
            transferId: transfer.id,
            userId,
            reason: 'TRANSFER_OUT',
          },
        });

        // 2.3. Obtener o crear stock en destino para el mismo producto
        let stockTo = await tx.stock.findFirst({
          where: {
            productId: stockFrom.productId,
            warehouseId: toWarehouse,
          },
        });

        if (!stockTo) {
          stockTo = await tx.stock.create({
            data: {
              productId: stockFrom.productId,
              warehouseId: toWarehouse,
              quantity: 0,
            },
          });
        }

        // 2.4. Actualizar stock en destino
        await tx.stock.update({
          where: { id: stockTo.id },
          data: {
            quantity: { increment: quantity },
            updatedAt: new Date(),
          },
        });

        // Auditoría positiva
        await tx.stockAudit.create({
          data: {
            stockId: stockTo.id,
            change: quantity,
            transferId: transfer.id,
            userId,
            reason: 'TRANSFER_IN',
          },
        });

        // 2.5. Crear detalle de transferencia
        await tx.transferDetail.create({
          data: {
            transferId: transfer.id,
            productId: stockFrom.productId,
            quantity,
          },
        });
      }

      // 3. Devolver la transferencia ya con sus relaciones
      return { message: 'Transferencia realizada exitosamente' };
    })
      .catch(error => {
        this.logger.error('Error al crear transferencia', error);
        throw error;
      });
  }

  async findAllTransferStock(): Promise<any[]> {
    const transfers = await this.dbService.transfer.findMany({
      include: {
        from: true,        // almacén de origen
        to: true,          // almacén de destino
        user: true,        // usuario que creó
        details: {
          include: { product: true }  // incluir nombre de producto
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transfers.map(t => ({
      id: t.id,
      fromWarehouseId: t.fromWarehouse,
      fromWarehouseName: t.from.name,
      toWarehouseId: t.toWarehouse,
      toWarehouseName: t.to.name,
      userId: t.userId,
      userEmail: t.user.email,
      userFirstName: t.user.first_name,
      userLastName: t.user.last_name,
      status: t.status,
      notes: t.notes,
      details: t.details.map(d => ({
        productId: d.productId,
        productName: d.product.name,
        quantity: d.quantity,
      })),
      createdAt: t.createdAt
    }));
  }

  async completeTransfer(id: number): Promise<any> {
    // Verificar que exista la transferencia
    const existing = await this.dbService.transfer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Transferencia con ID ${id} no encontrada`);
    }
    if (existing.status === 'COMPLETED') {
      throw new BadRequestException('La transferencia ya está completada');
    }

    // Actualizar el estado
    const updated = await this.dbService.transfer.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        from: true,
        to: true,
        user: true,
        details: { include: { product: true } },
      },
    });

    // Retornar objeto plano similar a findAll
    return {
      id: updated.id,
      fromWarehouseId: updated.fromWarehouse,
      fromWarehouseName: updated.from.name,
      toWarehouseId: updated.toWarehouse,
      toWarehouseName: updated.to.name,
      userId: updated.userId,
      userEmail: updated.user.email,
      userFirstName: updated.user.first_name,
      userLastName: updated.user.last_name,
      status: updated.status,
      notes: updated.notes,
      createdAt: updated.createdAt,
      details: updated.details.map(d => ({
        productId: d.productId,
        productName: d.product.name,
        quantity: d.quantity,
      })),
    };
  }

  async withdrawStock(dto: WithdrawStockDto, userId: number) {
    const { warehouseId, stockId, quantity } = dto;
    if (quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que cero');
    }

    return this.dbService.$transaction(async (tx) => {
      // Verificar usuario
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException(`Usuario ${userId} no encontrado`);
      }

      // Verificar stock
      const stockRecord = await tx.stock.findUnique({
        where: { id: stockId },
        select: { quantity: true, warehouseId: true },
      });
      if (!stockRecord || stockRecord.warehouseId !== warehouseId) {
        throw new BadRequestException('Stock no encontrado en el almacén indicado');
      }
      if (stockRecord.quantity < quantity) {
        throw new BadRequestException('Cantidad insuficiente en inventario');
      }

      // Actualizar stock
      const updatedStock = await tx.stock.update({
        where: { id: stockId },
        data: {
          quantity: { decrement: quantity },
          updatedAt: new Date(),
        },
      });

      // Crear auditoría
      await tx.stockAudit.create({
        data: {
          stockId,
          change: -quantity,
          occurredAt: new Date(),
          userId,              // ahora válido
          reason: 'Retiro de stock',
        },
      });

      return updatedStock;
    });
  }
}
