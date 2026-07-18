export type UserRole = 'admin' | 'user';

export interface User { id: string; email: string; name: string; role: UserRole; empresaNombre?: string; }
export interface CompanySettings { empresaNombre: string; }
export interface Caja { id: string; fechaInicio: string; fechaCierre: string | null; usuarioInicioId: string; usuarioCierreId: string | null; usuarioAsignadoId: string; montoInicial: number; estado: 'abierta' | 'cerrada'; }
export interface Nominacion { id: string; cajaId: string; denominacion: number; cantidad: number; subtotal: number; }
export interface Retiro { id: string; cajaId: string; monto: number; concepto: string; fecha: string; usuarioId: string; }
export interface Entrada extends Retiro { turno: 'AM' | 'PM'; }
export type HistoryKind = 'cajas' | 'entradas' | 'retiros' | 'nominaciones';
export type HistoryItem = Caja | Entrada | Retiro | Nominacion;
