import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
export declare class CampanaRemarketing extends AuditoriaEntity {
    id: string;
    nombre: string;
    descripcion?: string;
    mensaje: string;
    tipoMensaje: string;
    programadoEn: Date;
    ejecutadoEn?: Date;
    estadoCampana: string;
    scoreMin: number;
    scoreMax: number;
    canalObjetivo: string;
    totalEnviados: number;
    totalErrores: number;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<CampanaRemarketing>);
}
