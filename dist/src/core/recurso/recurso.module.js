"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const recurso_entity_1 = require("./entity/recurso.entity");
const recurso_service_1 = require("./service/recurso.service");
const recurso_controller_1 = require("./controller/recurso.controller");
const cliente_module_1 = require("../cliente/cliente.module");
let RecursoModule = class RecursoModule {
};
RecursoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([recurso_entity_1.Recurso]), cliente_module_1.ClienteModule],
        providers: [recurso_service_1.RecursoService],
        exports: [recurso_service_1.RecursoService],
        controllers: [recurso_controller_1.RecursoController],
    })
], RecursoModule);
exports.RecursoModule = RecursoModule;
//# sourceMappingURL=recurso.module.js.map