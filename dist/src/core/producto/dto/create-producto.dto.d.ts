export declare class CreateProductoDto {
    nombre: string;
    descripcion?: string;
    marca?: string;
    modelo?: string;
    categoria?: string;
    precio: number;
    precioOferta?: number;
    moneda?: string;
    stock?: number;
    imagenes?: string[];
    detalles?: Record<string, any>;
}
export declare class UpdateProductoDto extends CreateProductoDto {
    activo?: boolean;
    nombre: string;
    precio: number;
}
