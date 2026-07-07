import { Repository } from 'typeorm';
import { Agente } from '../../agente/entity/agente.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { AsignacionAgenteHumano } from '../entity/asignacion-agente-humano.entity';
import { ActividadAgenteHumano } from '../entity/actividad-agente-humano.entity';
import { CreateAgenteHumanoDto, UpdateAgenteHumanoDto } from '../dto/agente-humano.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class AgenteHumanoService extends BaseService {
    private readonly agenteRepository;
    private readonly usuarioRepository;
    private readonly asignacionRepository;
    private readonly actividadRepository;
    constructor(agenteRepository: Repository<Agente>, usuarioRepository: Repository<Usuario>, asignacionRepository: Repository<AsignacionAgenteHumano>, actividadRepository: Repository<ActividadAgenteHumano>);
    crear(dto: CreateAgenteHumanoDto, usuarioCreacion: string, clienteId: string): Promise<{
        credenciales?: {
            usuario: string;
            nombres: string;
            apellidos: string | undefined;
            correoElectronico: string | undefined;
        } | undefined;
        conversacionesActivas?: number | undefined;
        id: string;
        nombre: string;
        descripcion: string | undefined;
        tipoAgente: string;
        avatar: string;
        color: string;
        activo: boolean;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        especialidades: string[];
        horasTrabajo: Record<string, {
            inicio: string;
            fin: string;
        }>;
        clienteId: string;
        usuarioId: string | null;
        fechaCreacion: Date;
    }>;
    listar(clienteId: string): Promise<{
        credenciales?: {
            usuario: string;
            nombres: string;
            apellidos: string | undefined;
            correoElectronico: string | undefined;
        } | undefined;
        conversacionesActivas?: number | undefined;
        id: string;
        nombre: string;
        descripcion: string | undefined;
        tipoAgente: string;
        avatar: string;
        color: string;
        activo: boolean;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        especialidades: string[];
        horasTrabajo: Record<string, {
            inicio: string;
            fin: string;
        }>;
        clienteId: string;
        usuarioId: string | null;
        fechaCreacion: Date;
    }[]>;
    obtener(id: string, clienteId: string): Promise<{
        credenciales?: {
            usuario: string;
            nombres: string;
            apellidos: string | undefined;
            correoElectronico: string | undefined;
        } | undefined;
        conversacionesActivas?: number | undefined;
        id: string;
        nombre: string;
        descripcion: string | undefined;
        tipoAgente: string;
        avatar: string;
        color: string;
        activo: boolean;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        especialidades: string[];
        horasTrabajo: Record<string, {
            inicio: string;
            fin: string;
        }>;
        clienteId: string;
        usuarioId: string | null;
        fechaCreacion: Date;
    }>;
    obtenerPorUsuarioId(usuarioId: string): Promise<Agente | null>;
    actualizar(id: string, dto: UpdateAgenteHumanoDto, usuarioModificacion: string, clienteId: string): Promise<{
        credenciales?: {
            usuario: string;
            nombres: string;
            apellidos: string | undefined;
            correoElectronico: string | undefined;
        } | undefined;
        conversacionesActivas?: number | undefined;
        id: string;
        nombre: string;
        descripcion: string | undefined;
        tipoAgente: string;
        avatar: string;
        color: string;
        activo: boolean;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        especialidades: string[];
        horasTrabajo: Record<string, {
            inicio: string;
            fin: string;
        }>;
        clienteId: string;
        usuarioId: string | null;
        fechaCreacion: Date;
    }>;
    eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    cambiarDisponibilidad(agenteId: string, estado: string, clienteId: string): Promise<{
        estadoDisponibilidad: string;
    }>;
    obtenerDisponibles(clienteId: string): Promise<{
        credenciales?: {
            usuario: string;
            nombres: string;
            apellidos: string | undefined;
            correoElectronico: string | undefined;
        } | undefined;
        conversacionesActivas?: number | undefined;
        id: string;
        nombre: string;
        descripcion: string | undefined;
        tipoAgente: string;
        avatar: string;
        color: string;
        activo: boolean;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        especialidades: string[];
        horasTrabajo: Record<string, {
            inicio: string;
            fin: string;
        }>;
        clienteId: string;
        usuarioId: string | null;
        fechaCreacion: Date;
    }[]>;
    registrarSesion(usuarioId: string): Promise<void>;
    cerrarSesion(usuarioId: string): Promise<void>;
    estadisticas(agenteId: string, clienteId: string): Promise<{
        agenteId: string;
        nombre: string;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        totalAsignadas: number;
        activas: number;
        resueltas: number;
        escaladas: number;
        asignadasHoy: number;
        tiempoPromedioMinutos: number;
        tasaResolucion: number;
    }>;
    estadisticasEquipo(clienteId: string): Promise<{
        agenteId: string;
        nombre: string;
        estadoDisponibilidad: string;
        sesionActiva: boolean;
        ultimoAcceso: Date | null | undefined;
        totalAsignadas: number;
        activas: number;
        resueltas: number;
        escaladas: number;
        asignadasHoy: number;
        tiempoPromedioMinutos: number;
        tasaResolucion: number;
    }[]>;
    actividad(agenteId: string, clienteId: string, limite?: number): Promise<ActividadAgenteHumano[]>;
    registrarActividad(agenteHumanoId: string, clienteId: string, tipoActividad: string, detalles: Record<string, any>, conversacionId?: string): Promise<void>;
    private sanitizar;
}
