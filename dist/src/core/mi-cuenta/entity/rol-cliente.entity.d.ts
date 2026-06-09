import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
export interface PermisosRol {
    agentes?: {
        ver?: boolean;
        crear?: boolean;
        editar?: boolean;
        eliminar?: boolean;
    };
    herramientas?: {
        ver?: boolean;
        gestionar?: boolean;
    };
    conversaciones?: {
        ver?: boolean;
        responder?: boolean;
    };
    reportes?: {
        ver?: boolean;
    };
    configuracion?: {
        ver?: boolean;
        editar?: boolean;
    };
}
export declare class RolCliente extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    descripcion?: string;
    permisos: PermisosRol;
    esBase: boolean;
    cliente: Cliente;
    constructor(data?: Partial<RolCliente>);
}
