/// <reference types="multer" />
import { Response } from 'express';
import { ProductoService } from '../service/producto.service';
import { CreateProductoDto, UpdateProductoDto } from '../dto/create-producto.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ProductoController {
    private readonly productoService;
    constructor(productoService: ProductoService);
    listar(q: string, categoria: string, pagina: string, limite: string, req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateProductoDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateProductoDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    subirImagenes(id: string, files: Express.Multer.File[], req: any): Promise<SuccessResponseDto>;
    eliminarImagen(id: string, filename: string, req: any): Promise<SuccessResponseDto>;
    exportarExcel(req: any, res: Response): Promise<void>;
    importarExcel(file: Express.Multer.File, req: any): Promise<SuccessResponseDto>;
}
