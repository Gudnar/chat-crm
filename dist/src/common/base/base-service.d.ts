import { Logger } from '@nestjs/common';
export declare abstract class BaseService {
    protected logger: Logger;
    protected constructor(name: string);
    protected successResponse(datos: any, mensaje?: string): {
        finalizado: boolean;
        mensaje: string;
        datos: any;
    };
    protected errorResponse(mensaje: string, datos?: any): {
        finalizado: boolean;
        mensaje: string;
        datos: any;
    };
}
