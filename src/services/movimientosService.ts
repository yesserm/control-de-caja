import type { Entrada, Retiro } from '../types/models';
import { request } from './api';

export const getRetiros = (cajaId: number) => request<Retiro[]>(`/retiros?cajaId=${cajaId}`);
export const getEntradas = (cajaId: number) => request<Entrada[]>(`/entradas?cajaId=${cajaId}`);
export const crearRetiro = (retiro: Omit<Retiro, 'id' | 'fecha'>) => request<Retiro>('/retiros', { method: 'POST', body: JSON.stringify({ ...retiro, fecha: new Date().toISOString() }) });
export const crearEntrada = (entrada: Omit<Entrada, 'id' | 'fecha'>) => request<Entrada>('/entradas', { method: 'POST', body: JSON.stringify({ ...entrada, fecha: new Date().toISOString() }) });
