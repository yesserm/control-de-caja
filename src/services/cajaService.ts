import type { Caja, User, Nominacion } from '../types/models';
import { dataProvider } from '../providers/provider';

export const getCajaAbierta = (user?: User) => dataProvider.getCajaAbierta(user);
export const getNominaciones = (cajaId: string) => dataProvider.getNominaciones(cajaId);
export const abrirCaja = (usuarioInicioId: string, usuarioAsignadoId = usuarioInicioId, montoInicial = 0) => dataProvider.abrirCaja({ fechaInicio: new Date().toISOString(), fechaCierre: null, usuarioInicioId, usuarioCierreId: null, usuarioAsignadoId, montoInicial, estado: 'abierta' });
export const cerrarCaja = (caja: Caja, usuarioCierreId: string) => dataProvider.cerrarCaja(caja.id, { fechaCierre: new Date().toISOString(), usuarioCierreId, estado: 'cerrada' });
export const saveNominacion = (nominacion: Omit<Nominacion, 'id'>, existing?: Nominacion) => dataProvider.saveNominacion(nominacion, existing?.id);
