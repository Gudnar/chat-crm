/// <reference types="node" />
import { Repository } from 'typeorm';
import { ArticuloTienda } from '../entity/articulo-tienda.entity';
import { CategoriaTienda } from '../entity/categoria-tienda.entity';
import { ArticuloSucursal } from '../entity/articulo-sucursal.entity';
import { CreateArticuloTiendaDto, UpdateArticuloTiendaDto } from '../dto/articulo-tienda.dto';
import { CreateCategoriaTiendaDto, UpdateCategoriaTiendaDto } from '../dto/categoria-tienda.dto';
import { DisponibilidadSucursalDto } from '../dto/disponibilidad-tienda.dto';
import { BaseService } from '../../../common/base/base-service';
import { PresetImagen } from '../../../common/lib/imagen.util';
export declare class TiendaService extends BaseService {
    private readonly repo;
    private readonly categoriaRepo;
    private readonly articuloSucursalRepo;
    constructor(repo: Repository<ArticuloTienda>, categoriaRepo: Repository<CategoriaTienda>, articuloSucursalRepo: Repository<ArticuloSucursal>);
    construirUrlImagen(filename: string): string;
    guardarImagenProcesada(buffer: Buffer, preset: PresetImagen): Promise<string>;
    listar(clienteId: string): Promise<ArticuloTienda[]>;
    obtener(id: string, clienteId: string): Promise<ArticuloTienda>;
    crear(dto: CreateArticuloTiendaDto, clienteId: string, usuarioCreacion: string): Promise<ArticuloTienda>;
    actualizar(id: string, dto: UpdateArticuloTiendaDto, clienteId: string, usuarioModificacion: string): Promise<ArticuloTienda>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    setImagen(id: string, url: string, clienteId: string, usuarioModificacion: string): Promise<ArticuloTienda>;
    listarCategorias(clienteId: string): Promise<CategoriaTienda[]>;
    obtenerCategoria(id: string, clienteId: string): Promise<CategoriaTienda>;
    crearCategoria(dto: CreateCategoriaTiendaDto, clienteId: string, usuarioCreacion: string): Promise<CategoriaTienda>;
    actualizarCategoria(id: string, dto: UpdateCategoriaTiendaDto, clienteId: string, usuarioModificacion: string): Promise<CategoriaTienda>;
    eliminarCategoria(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    setImagenCategoria(id: string, url: string, clienteId: string, usuarioModificacion: string): Promise<CategoriaTienda>;
    listarDisponibilidad(articuloId: string, clienteId: string): Promise<ArticuloSucursal[]>;
    actualizarDisponibilidad(articuloId: string, filas: DisponibilidadSucursalDto[], clienteId: string, usuarioId: string): Promise<ArticuloSucursal[]>;
}
