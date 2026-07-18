import type { Entrada, Retiro } from '../types/models';
import { dataProvider } from '../providers/provider';

export const getRetiros = (cajaId: string) => dataProvider.getRetiros(cajaId);
export const getEntradas = (cajaId: string) => dataProvider.getEntradas(cajaId);
export const crearRetiro = (retiro: Omit<Retiro, 'id' | 'fecha'>) => dataProvider.crearRetiro({ ...retiro, fecha: new Date().toISOString() });
export const crearEntrada = (entrada: Omit<Entrada, 'id' | 'fecha'>) => dataProvider.crearEntrada({ ...entrada, fecha: new Date().toISOString() });
