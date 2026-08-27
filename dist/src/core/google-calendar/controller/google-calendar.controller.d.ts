import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service';
import { GoogleCalendarService } from '../service/google-calendar.service';
import { AgenteGoogleCalendarService } from '../service/agente-google-calendar.service';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class GoogleCalendarController {
    private readonly googleCalendarService;
    private readonly agenteGoogleCalendarService;
    private readonly agenteHumanoService;
    private readonly jwtService;
    private readonly configService;
    constructor(googleCalendarService: GoogleCalendarService, agenteGoogleCalendarService: AgenteGoogleCalendarService, agenteHumanoService: AgenteHumanoService, jwtService: JwtService, configService: ConfigService);
    conectar(req: any): Promise<SuccessResponseDto>;
    callback(code: string, state: string, error: string, res: Response): Promise<void>;
    estado(req: any): Promise<SuccessResponseDto>;
    desconectar(req: any): Promise<SuccessResponseDto>;
}
