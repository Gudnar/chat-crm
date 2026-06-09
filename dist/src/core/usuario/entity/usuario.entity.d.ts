import { Cliente } from '../../cliente/entity/cliente.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Usuario extends AuditoriaEntity {
    id: string;
    usuario: string;
    contrasena: string;
    correoElectronico?: string;
    nombres: string;
    apellidos?: string;
    rol: string;
    intentos: number;
    fechaBloqueo?: Date | null;
    clienteId: string | null;
    cliente: Cliente | null;
    rolClienteId: string | null;
    hashPassword(): Promise<void>;
    constructor(data?: Partial<Usuario>);
}
