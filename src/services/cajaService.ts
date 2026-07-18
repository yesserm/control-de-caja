import type { Caja, Nominacion } from '../types/models';
import { request } from './api';

export const getCajaAbierta = async () => (await request<Caja[]>('/cajas?estado=abierta'))[0] ?? null;
export const getNominaciones = (cajaId: number) => request<Nominacion[]>(`/nominaciones?cajaId=${cajaId}`);
export const abrirCaja = (usuarioInicioId: number) => request<Caja>('/cajas', { method: 'POST', body: JSON.stringify({ fechaInicio: new Date().toISOString(), fechaCierre: null, usuarioInicioId, usuarioCierreId: null, estado: 'abierta' }) });
export const cerrarCaja = (caja: Caja, usuarioCierreId: number) => request<Caja>(`/cajas/${caja.id}`, { method: 'PATCH', body: JSON.stringify({ fechaCierre: new Date().toISOString(), usuarioCierreId, estado: 'cerrada' }) });
export const saveNominacion = (nominacion: Omit<Nominacion, 'id'>, existing?: Nominacion) => request<Nominacion>(existing ? `/nominaciones/${existing.id}` : '/nominaciones', { method: existing ? 'PATCH' : 'POST', body: JSON.stringify(nominacion) });
