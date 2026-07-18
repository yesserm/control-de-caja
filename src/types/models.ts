export type UserRole = 'admin' | 'user';

export interface User { id: number; username: string; password: string; name: string; role: UserRole; }
export interface Caja { id: number; fechaInicio: string; fechaCierre: string | null; usuarioInicioId: number; usuarioCierreId: number | null; estado: 'abierta' | 'cerrada'; }
export interface Nominacion { id: number; cajaId: number; denominacion: number; cantidad: number; subtotal: number; }
export interface Retiro { id: number; cajaId: number; monto: number; concepto: string; fecha: string; usuarioId: number; }
export interface Entrada extends Retiro { turno: 'AM' | 'PM'; }
