import type { Caja, CompanySettings, Entrada, Nominacion, Retiro, User } from '../types/models';

export type DataProviderName = 'json' | 'sqlite' | 'firebase';
export type NewCaja = Omit<Caja, 'id'>;
export type NewNominacion = Omit<Nominacion, 'id'>;
export type NewRetiro = Omit<Retiro, 'id'>;
export type NewEntrada = Omit<Entrada, 'id'>;

export interface DataProvider {
  authenticate(email: string, password: string): Promise<User | null>;
  authenticateWithGoogle(idToken: string): Promise<User>;
  logout(): Promise<void>;
  getCajaAbierta(user?: User): Promise<Caja | null>;
  getUsers(): Promise<User[]>;
  getCompanySettings(): Promise<CompanySettings>;
  updateCompanyName(name: string): Promise<CompanySettings>;
  updateUserRole(userId: string, role: User['role']): Promise<User>;
  getNominaciones(cajaId: string): Promise<Nominacion[]>;
  abrirCaja(caja: NewCaja): Promise<Caja>;
  cerrarCaja(cajaId: string, changes: Pick<Caja, 'fechaCierre' | 'usuarioCierreId' | 'estado'>): Promise<Caja>;
  saveNominacion(nominacion: NewNominacion, existingId?: string): Promise<Nominacion>;
  getRetiros(cajaId: string): Promise<Retiro[]>;
  getEntradas(cajaId: string): Promise<Entrada[]>;
  crearRetiro(retiro: NewRetiro): Promise<Retiro>;
  crearEntrada(entrada: NewEntrada): Promise<Entrada>;
}
