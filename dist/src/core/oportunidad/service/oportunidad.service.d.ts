import { Repository } from 'typeorm';
import { OportunidadVenta } from '../entity/oportunidad-venta.entity';
import { Conversacion } from '../../conversacion/entity/conversacion.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { CreateOportunidadDto, RegistrarSeguimientoDto, UpdateOportunidadDto } from '../dto/oportunidad.dto';
import { BaseService } from '../../../common/base/base-service';
export interface FiltrosOportunidad {
    q?: string;
    estadoOportunidad?: string;
    prioridad?: string;
    asignadoA?: string;
}
export declare class OportunidadService extends BaseService {
    private readonly repo;
    private readonly conversacionRepo;
    private readonly usuarioRepo;
    constructor(repo: Repository<OportunidadVenta>, conversacionRepo: Repository<Conversacion>, usuarioRepo: Repository<Usuario>);
    private nombreUsuario;
    private entradaHistorial;
    private sincronizarDesdeConversacion;
    private generarNumero;
    listar(clienteId: string, filtros?: FiltrosOportunidad, pagina?: number, limite?: number): Promise<{
        items: OportunidadVenta[];
        total: number;
        pagina: number;
        totalPaginas: number;
        limite: number;
    }>;
    obtener(id: string, clienteId: string): Promise<OportunidadVenta>;
    crear(dto: CreateOportunidadDto, clienteId: string, usuarioId: string): Promise<OportunidadVenta>;
    actualizar(id: string, dto: UpdateOportunidadDto, clienteId: string, usuarioId: string): Promise<OportunidadVenta>;
    cambiarEstado(id: string, nuevoEstado: string, motivo: string | undefined, clienteId: string, usuarioId: string): Promise<OportunidadVenta>;
    asignar(id: string, asignadoA: string, clienteId: string, usuarioId: string): Promise<OportunidadVenta>;
    registrarSeguimiento(id: string, dto: RegistrarSeguimientoDto, clienteId: string, usuarioId: string): Promise<OportunidadVenta>;
    eliminar(id: string, clienteId: string, usuarioId: string): Promise<void>;
    estadisticas(clienteId: string, asignadoA?: string): Promise<any>;
    usuariosAsignables(clienteId: string): Promise<Array<{
        id: string;
        nombre: string;
        rol: string;
    }>>;
}
