import { Type } from "class-transformer";
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class CreateStockDto {

    @IsInt()
    fromWarehouse: number;

    @IsInt()
    toWarehouse: number;

    @IsInt()
    userId: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTransferDetailDto)
    details: CreateTransferDetailDto[];
}


export class CreateTransferDetailDto {
    @IsInt({ message: 'stockId debe ser un entero' })
    stockId: number; 

    @IsNumber({}, { message: 'quantity debe ser numérico' })
    @Min(0.000001, { message: 'quantity debe ser mayor que cero' })
    quantity: number;
}