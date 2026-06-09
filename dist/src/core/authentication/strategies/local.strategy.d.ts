import { Strategy } from 'passport-local';
import { AuthenticationService } from '../service/authentication.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authService;
    constructor(authService: AuthenticationService);
    validate(usuario: string, contrasena: string): Promise<any>;
}
export {};
