import { BaseEntity } from 'typeorm';
export declare abstract class AuditoriaEntity extends BaseEntity {
    estado: string;
    transaccion: string;
    usuarioCreacion: string;
    fechaCreacion: Date;
    usuarioModificacion?: string | null;
    fechaModificacion?: Date | null;
    insertarTransaccion(): void;
    actualizarTransaccion(): void;
    protected constructor(data?: Partial<AuditoriaEntity>);
}
