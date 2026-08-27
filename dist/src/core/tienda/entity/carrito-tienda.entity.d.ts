import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export interface OpcionSeleccionadaCarrito {
    grupoId: string;
    grupoNombre: string;
    opcionId: string;
    opcionNombre: string;
    precioExtra: number;
}
export interface ItemCarritoTienda {
    id: string;
    articuloId: string;
    nombre: string;
    precioBase: number;
    cantidad: number;
    notas?: string;
    opciones: OpcionSeleccionadaCarrito[];
}
export declare class CarritoTienda extends AuditoriaEntity {
    id: string;
    clienteId: string;
    token: string;
    conversacionId?: string;
    contactoTelefono?: string;
    sucursalId?: string;
    codigoPedido?: string;
    metodoPago?: string;
    estadoCarrito: string;
    items: ItemCarritoTienda[];
    total: number;
    confirmadoEn?: Date;
    constructor(data?: Partial<CarritoTienda>);
}
