import type { Caja, CompanySettings, Entrada, HistoryItem, HistoryKind, Nominacion, Retiro, User } from '../types/models';
import { request } from '../services/api';
import type { DataProvider } from './types';

type JsonUser = User & { password: string };
const text = (value: string | number) => String(value);
const withoutPassword = ({ password: _password, ...user }: JsonUser): User => ({ ...user, id: text(user.id) });
const caja = (value: Caja): Caja => ({ ...value, id: text(value.id), usuarioInicioId: text(value.usuarioInicioId), usuarioCierreId: value.usuarioCierreId === null ? null : text(value.usuarioCierreId) });
const nominacion = (value: Nominacion): Nominacion => ({ ...value, id: text(value.id), cajaId: text(value.cajaId) });
const retiro = (value: Retiro): Retiro => ({ ...value, id: text(value.id), cajaId: text(value.cajaId), usuarioId: text(value.usuarioId) });
const entrada = (value: Entrada): Entrada => ({ ...retiro(value), turno: value.turno });

export const jsonProvider: DataProvider = {
  async authenticate(email, password) {
    const users = await request<JsonUser[]>(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    return users[0] ? withoutPassword(users[0]) : null;
  },
  async authenticateWithGoogle() { throw new Error('El inicio con Google está disponible cuando EXPO_PUBLIC_DATA_PROVIDER=firebase.'); },
  async logout() {},
  async getCajaAbierta(user) { const values = (await request<Caja[]>('/cajas?estado=abierta')).map(caja); return values.find((value) => user?.role === 'admin' || value.usuarioAsignadoId === user?.id) ?? null; },
  async getUsers() { return (await request<JsonUser[]>('/users')).map(withoutPassword); },
  async getCompanySettings() { const value = await request<CompanySettings[]>('/settings'); return value[0] ?? { empresaNombre: 'Parada Caribe' }; },
  async updateCompanyName(empresaNombre) { const settings = await this.getCompanySettings(); return request<CompanySettings>('/settings/1', { method: 'PATCH', body: JSON.stringify({ ...settings, empresaNombre }) }); },
  async updateUserRole(id, role) { return withoutPassword(await request<JsonUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) })); },
  async getHistory(kind: HistoryKind): Promise<HistoryItem[]> { return request<HistoryItem[]>(`/${kind}`); },
  async getNominaciones(cajaId) { return (await request<Nominacion[]>(`/nominaciones?cajaId=${encodeURIComponent(cajaId)}`)).map(nominacion); },
  async abrirCaja(value) { return caja(await request<Caja>('/cajas', { method: 'POST', body: JSON.stringify(value) })); },
  async cerrarCaja(id, changes) { return caja(await request<Caja>(`/cajas/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })); },
  async saveNominacion(value, id) { return nominacion(await request<Nominacion>(id ? `/nominaciones/${id}` : '/nominaciones', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(value) })); },
  async getRetiros(cajaId) { return (await request<Retiro[]>(`/retiros?cajaId=${encodeURIComponent(cajaId)}`)).map(retiro); },
  async getEntradas(cajaId) { return (await request<Entrada[]>(`/entradas?cajaId=${encodeURIComponent(cajaId)}`)).map(entrada); },
  async crearRetiro(value) { return retiro(await request<Retiro>('/retiros', { method: 'POST', body: JSON.stringify(value) })); },
  async crearEntrada(value) { return entrada(await request<Entrada>('/entradas', { method: 'POST', body: JSON.stringify(value) })); },
};
