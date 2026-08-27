import { SucursalService } from '../service/sucursal.service';
import { InventarioSucursalService } from '../service/inventario-sucursal.service';
import { ClienteFinalService } from '../service/cliente-final.service';
import { PedidoService } from '../service/pedido.service';
import { TransaccionService } from '../service/transaccion.service';
import { CajaSucursalService } from '../service/caja-sucursal.service';
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/create-sucursal.dto';
import { CreateInventarioSucursalDto, UpdateInventarioSucursalDto } from '../dto/inventario-sucursal.dto';
import { CreateClienteFinalDto, UpdateClienteFinalDto } from '../dto/cliente-final.dto';
import { CreatePedidoDto, UpdatePedidoEstadoDto, UpdatePedidoEstadoPagoDto } from '../dto/pedido.dto';
import { CreateTransaccionDto } from '../dto/transaccion.dto';
import { AbrirCajaDto, CerrarCajaDto } from '../dto/caja-sucursal.dto';
export declare class SucursalController {
    private readonly sucursalService;
    private readonly inventarioService;
    private readonly clienteFinalService;
    private readonly pedidoService;
    private readonly transaccionService;
    private readonly cajaService;
    constructor(sucursalService: SucursalService, inventarioService: InventarioSucursalService, clienteFinalService: ClienteFinalService, pedidoService: PedidoService, transaccionService: TransaccionService, cajaService: CajaSucursalService);
    listar(req: any): Promise<import("../entity/sucursal.entity").Sucursal[]>;
    crear(dto: CreateSucursalDto, req: any): Promise<import("../entity/sucursal.entity").Sucursal>;
    listarInventario(sucursalId: string, req: any): Promise<import("../entity/inventario-sucursal.entity").InventarioSucursal[]>;
    crearInventario(sucursalId: string, dto: CreateInventarioSucursalDto, req: any): Promise<import("../entity/inventario-sucursal.entity").InventarioSucursal>;
    actualizarInventario(sucursalId: string, id: string, dto: UpdateInventarioSucursalDto, req: any): Promise<import("../entity/inventario-sucursal.entity").InventarioSucursal>;
    eliminarInventario(sucursalId: string, id: string, req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarPedidos(sucursalId: string, req: any, estado?: string): Promise<import("../entity/pedido.entity").Pedido[]>;
    crearPedido(sucursalId: string, dto: CreatePedidoDto, req: any): Promise<import("../entity/pedido.entity").Pedido>;
    cambiarEstadoPedido(id: string, dto: UpdatePedidoEstadoDto, req: any): Promise<import("../entity/pedido.entity").Pedido>;
    cambiarEstadoPago(id: string, dto: UpdatePedidoEstadoPagoDto, req: any): Promise<import("../entity/pedido.entity").Pedido>;
    listarClientes(sucursalId: string, req: any): Promise<import("../entity/cliente-final.entity").ClienteFinal[]>;
    crearCliente(sucursalId: string, dto: CreateClienteFinalDto, req: any): Promise<import("../entity/cliente-final.entity").ClienteFinal>;
    actualizarCliente(sucursalId: string, clienteFinalId: string, dto: UpdateClienteFinalDto, req: any): Promise<import("../entity/cliente-final.entity").ClienteFinal>;
    listarCajas(sucursalId: string, req: any): Promise<import("../entity/caja-sucursal.entity").CajaSucursal[]>;
    abrirCaja(sucursalId: string, dto: AbrirCajaDto, req: any): Promise<import("../entity/caja-sucursal.entity").CajaSucursal>;
    cerrarCaja(sucursalId: string, cajaId: string, dto: CerrarCajaDto, req: any): Promise<import("../entity/caja-sucursal.entity").CajaSucursal>;
    listarTransacciones(sucursalId: string, req: any): Promise<import("../entity/transaccion.entity").Transaccion[]>;
    crearTransaccion(sucursalId: string, dto: CreateTransaccionDto, req: any): Promise<import("../entity/transaccion.entity").Transaccion>;
    resumen(id: string, req: any): Promise<{
        sucursal: import("../entity/sucursal.entity").Sucursal;
        pedidosHoy: number;
        stockBajo: number;
        cajaAbierta: boolean;
    }>;
    obtener(id: string, req: any): Promise<import("../entity/sucursal.entity").Sucursal>;
    actualizar(id: string, dto: UpdateSucursalDto, req: any): Promise<import("../entity/sucursal.entity").Sucursal>;
    eliminar(id: string, req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
