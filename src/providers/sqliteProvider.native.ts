import * as SQLite from 'expo-sqlite';
import type { Caja, CompanySettings, Entrada, Nominacion, Retiro, User } from '../types/models';
import type { DataProvider } from './types';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function database() {
  if (!databasePromise) databasePromise = initialize();
  return databasePromise;
}

async function initialize() {
  const db = await SQLite.openDatabaseAsync('control-de-caja.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, empresaNombre TEXT);
    CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY NOT NULL, empresaNombre TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS cajas (id TEXT PRIMARY KEY NOT NULL, fechaInicio TEXT NOT NULL, fechaCierre TEXT, usuarioInicioId TEXT NOT NULL, usuarioCierreId TEXT, usuarioAsignadoId TEXT NOT NULL DEFAULT '', montoInicial REAL NOT NULL DEFAULT 0, estado TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS nominaciones (id TEXT PRIMARY KEY NOT NULL, cajaId TEXT NOT NULL, denominacion INTEGER NOT NULL, cantidad INTEGER NOT NULL, subtotal REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS retiros (id TEXT PRIMARY KEY NOT NULL, cajaId TEXT NOT NULL, monto REAL NOT NULL, concepto TEXT NOT NULL, fecha TEXT NOT NULL, usuarioId TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS entradas (id TEXT PRIMARY KEY NOT NULL, cajaId TEXT NOT NULL, monto REAL NOT NULL, concepto TEXT NOT NULL, turno TEXT NOT NULL, fecha TEXT NOT NULL, usuarioId TEXT NOT NULL);
  `);
  const userColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(users)');
  const cajaColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(cajas)');
  if (!userColumns.some((column) => column.name === 'empresaNombre')) await db.execAsync('ALTER TABLE users ADD COLUMN empresaNombre TEXT');
  if (!cajaColumns.some((column) => column.name === 'usuarioAsignadoId')) await db.execAsync("ALTER TABLE cajas ADD COLUMN usuarioAsignadoId TEXT NOT NULL DEFAULT ''");
  if (!cajaColumns.some((column) => column.name === 'montoInicial')) await db.execAsync('ALTER TABLE cajas ADD COLUMN montoInicial REAL NOT NULL DEFAULT 0');
  await db.execAsync(`
    INSERT OR IGNORE INTO users (id, email, password, name, role, empresaNombre) VALUES ('1', 'admin@caja.local', '1234', 'Administrador', 'admin', 'Parada Caribe');
    INSERT OR IGNORE INTO users (id, email, password, name, role, empresaNombre) VALUES ('2', 'cajero@caja.local', '1234', 'Cajero', 'user', 'Parada Caribe');
    INSERT OR IGNORE INTO settings (id, empresaNombre) VALUES ('1', 'Parada Caribe');
    INSERT OR IGNORE INTO cajas (id, fechaInicio, fechaCierre, usuarioInicioId, usuarioCierreId, usuarioAsignadoId, montoInicial, estado) VALUES ('1', '2026-07-18T08:00:00.000Z', NULL, '1', NULL, '2', 0, 'abierta');
    INSERT OR IGNORE INTO nominaciones (id, cajaId, denominacion, cantidad, subtotal) VALUES ('1', '1', 100, 5, 500);
    INSERT OR IGNORE INTO nominaciones (id, cajaId, denominacion, cantidad, subtotal) VALUES ('2', '1', 500, 3, 1500);
  `);
  return db;
}

export const sqliteProvider: DataProvider = {
  async authenticate(email, password) { const row = await (await database()).getFirstAsync<User & { password: string }>('SELECT * FROM users WHERE email = ? AND password = ?', email, password); if (!row) return null; const { password: _password, ...user } = row; return user; },
  async authenticateWithGoogle() { throw new Error('El inicio con Google está disponible cuando EXPO_PUBLIC_DATA_PROVIDER=firebase.'); },
  async logout() {},
  async getCajaAbierta(user) { return (await database()).getFirstAsync<Caja>(user?.role === 'admin' ? "SELECT * FROM cajas WHERE estado = 'abierta' LIMIT 1" : "SELECT * FROM cajas WHERE estado = 'abierta' AND usuarioAsignadoId = ? LIMIT 1", ...(user?.role === 'admin' ? [] : [user?.id ?? ''])); },
  async getUsers() { return (await (await database()).getAllAsync<User>('SELECT id, email, name, role, empresaNombre FROM users ORDER BY name')); },
  async getCompanySettings() { return (await (await database()).getFirstAsync<CompanySettings>('SELECT empresaNombre FROM settings WHERE id = ?', '1')) ?? { empresaNombre: 'Parada Caribe' }; },
  async updateCompanyName(empresaNombre) { const db = await database(); await db.runAsync('UPDATE settings SET empresaNombre = ? WHERE id = ?', empresaNombre, '1'); await db.runAsync('UPDATE users SET empresaNombre = ?', empresaNombre); return { empresaNombre }; },
  async updateUserRole(id, role) { const db = await database(); await db.runAsync('UPDATE users SET role = ? WHERE id = ?', role, id); return (await db.getFirstAsync<User>('SELECT id, email, name, role, empresaNombre FROM users WHERE id = ?', id))!; },
  async getNominaciones(cajaId) { return (await database()).getAllAsync<Nominacion>('SELECT * FROM nominaciones WHERE cajaId = ?', cajaId); },
  async abrirCaja(caja) { const id = makeId('caja'); await (await database()).runAsync('INSERT INTO cajas VALUES (?, ?, ?, ?, ?, ?, ?, ?)', id, caja.fechaInicio, caja.fechaCierre, caja.usuarioInicioId, caja.usuarioCierreId, caja.usuarioAsignadoId, caja.montoInicial, caja.estado); return { id, ...caja }; },
  async cerrarCaja(id, changes) { const db = await database(); await db.runAsync('UPDATE cajas SET fechaCierre = ?, usuarioCierreId = ?, estado = ? WHERE id = ?', changes.fechaCierre, changes.usuarioCierreId, changes.estado, id); return (await db.getFirstAsync<Caja>('SELECT * FROM cajas WHERE id = ?', id))!; },
  async saveNominacion(nominacion, existingId) { const db = await database(); const id = existingId ?? makeId('nom'); if (existingId) await db.runAsync('UPDATE nominaciones SET cajaId = ?, denominacion = ?, cantidad = ?, subtotal = ? WHERE id = ?', nominacion.cajaId, nominacion.denominacion, nominacion.cantidad, nominacion.subtotal, id); else await db.runAsync('INSERT INTO nominaciones VALUES (?, ?, ?, ?, ?)', id, nominacion.cajaId, nominacion.denominacion, nominacion.cantidad, nominacion.subtotal); return { id, ...nominacion }; },
  async getRetiros(cajaId) { return (await database()).getAllAsync<Retiro>('SELECT * FROM retiros WHERE cajaId = ? ORDER BY fecha DESC', cajaId); },
  async getEntradas(cajaId) { return (await database()).getAllAsync<Entrada>('SELECT * FROM entradas WHERE cajaId = ? ORDER BY fecha DESC', cajaId); },
  async crearRetiro(retiro) { const id = makeId('ret'); await (await database()).runAsync('INSERT INTO retiros VALUES (?, ?, ?, ?, ?, ?)', id, retiro.cajaId, retiro.monto, retiro.concepto, retiro.fecha, retiro.usuarioId); return { id, ...retiro }; },
  async crearEntrada(entrada) { const id = makeId('ent'); await (await database()).runAsync('INSERT INTO entradas VALUES (?, ?, ?, ?, ?, ?, ?)', id, entrada.cajaId, entrada.monto, entrada.concepto, entrada.turno, entrada.fecha, entrada.usuarioId); return { id, ...entrada }; },
};
