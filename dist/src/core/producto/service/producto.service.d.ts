/// <reference types="node" />
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Producto } from '../entity/producto.entity';
import { CreateProductoDto, UpdateProductoDto } from '../dto/create-producto.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ProductoService extends BaseService {
    private readonly repo;
    private readonly configService;
    constructor(repo: Repository<Producto>, configService: ConfigService);
    construirUrlImagen(filename: string): string;
    resolverUrlsImagenes(filenames: string[]): string[];
    listar(clienteId: string, q?: string, categoria?: string): Promise<Producto[]>;
    obtener(id: string, clienteId: string): Promise<Producto>;
    crear(dto: CreateProductoDto, clienteId: string, usuarioCreacion: string): Promise<Producto>;
    actualizar(id: string, dto: UpdateProductoDto, clienteId: string, usuarioModificacion: string): Promise<Producto>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    agregarImagenes(id: string, filenames: string[], clienteId: string, usuarioModificacion: string): Promise<Producto>;
    eliminarImagen(id: string, filename: string, clienteId: string, usuarioModificacion: string): Promise<Producto>;
    private borrarArchivo;
    buscar(clienteId: string, termino: string, categoria?: string): Promise<Producto[]>;
    formatearParaClaude(productos: Producto[]): string;
    exportarExcel(clienteId: string): Promise<Buffer>;
    importarExcel(buffer: Buffer, clienteId: string, usuarioCreacion: string): Promise<{
        creados: number;
        errores: string[];
    }>;
}
