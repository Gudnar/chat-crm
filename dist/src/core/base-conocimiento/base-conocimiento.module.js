"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConocimientoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const base_conocimiento_entity_1 = require("./entity/base-conocimiento.entity");
const base_conocimiento_service_1 = require("./service/base-conocimiento.service");
const base_conocimiento_controller_1 = require("./controller/base-conocimiento.controller");
const agente_module_1 = require("../agente/agente.module");
let BaseConocimientoModule = class BaseConocimientoModule {
};
BaseConocimientoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([base_conocimiento_entity_1.BaseConocimiento]), agente_module_1.AgenteModule],
        providers: [base_conocimiento_service_1.BaseConocimientoService],
        exports: [base_conocimiento_service_1.BaseConocimientoService],
        controllers: [base_conocimiento_controller_1.BaseConocimientoController],
    })
], BaseConocimientoModule);
exports.BaseConocimientoModule = BaseConocimientoModule;
//# sourceMappingURL=base-conocimiento.module.js.map