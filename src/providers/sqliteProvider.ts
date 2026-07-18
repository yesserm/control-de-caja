import type { DataProvider } from './types';

const unavailable = (): never => { throw new Error('SQLite está disponible solo en Android e iOS. En web selecciona EXPO_PUBLIC_DATA_PROVIDER=json.'); };

export const sqliteProvider: DataProvider = {
  authenticate: async () => unavailable(),
  authenticateWithGoogle: async () => unavailable(),
  logout: async () => unavailable(),
  getCajaAbierta: async () => unavailable(),
  getUsers: async () => unavailable(),
  getCompanySettings: async () => unavailable(),
  updateCompanyName: async () => unavailable(),
  updateUserRole: async () => unavailable(),
  getNominaciones: async () => unavailable(),
  abrirCaja: async () => unavailable(),
  cerrarCaja: async () => unavailable(),
  saveNominacion: async () => unavailable(),
  getRetiros: async () => unavailable(),
  getEntradas: async () => unavailable(),
  crearRetiro: async () => unavailable(),
  crearEntrada: async () => unavailable(),
};
