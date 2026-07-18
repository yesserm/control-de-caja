import * as SQLite from 'expo-sqlite';
import type { Caja, Entrada, Nominacion, Retiro, User } from '../types/models';
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
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS cajas (id TEXT PRIMARY KEY NOT NULL, fechaInicio TEXT NOT NULL, fechaCierre TEXT, usuarioInicioId TEXT NOT NULL, usuarioCierreId TEXT, estado TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS nominaciones (id TEXT PRIMARY KEY NOT NULL, cajaId TEXT NOT NULL, denominacion INTEGER NOT NULL, cantidad INTEGER NOT NULL, subtotal REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS retiros (id TEXT PRIMARY KEY NOT NULL, cajaId TEXT NOT NULL, monto REAL NOT NULL, concepto TEXT NOT NULL, fecha TEXT NOT NULL, usuarioId TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS entradas (id TEXT PRIMARY KEY NOT NULL, cajaId TEXT NOT NULL, monto REAL NOT NULL, concepto TEXT NOT NULL, turno TEXT NOT NULL, fecha TEXT NOT NULL, usuarioId TEXT NOT NULL);
    INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES ('1', 'admin@caja.local', '1234', 'Administrador', 'admin');
    INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES ('2', 'cajero@caja.local', '1234', 'Cajero', 'user');
    INSERT OR IGNORE INTO cajas (id, fechaInicio, fechaCierre, usuarioInicioId, usuarioCierreId, estado) VALUES ('1', '2026-07-18T08:00:00.000Z', NULL, '1', NULL, 'abierta');
    INSERT OR IGNORE INTO nominaciones (id, cajaId, denominacion, cantidad, subtotal) VALUES ('1', '1', 100, 5, 500);
    INSERT OR IGNORE INTO nominaciones (id, cajaId, denominacion, cantidad, subtotal) VALUES ('2', '1', 500, 3, 1500);
  `);
  return db;
}

export const sqliteProvider: DataProvider = {
  async authenticate(email, password) { const row = await (await database()).getFirstAsync<User & { password: string }>('SELECT * FROM users WHERE email = ? AND password = ?', email, password); if (!row) return null; const { password: _password, ...user } = row; return user; },
  async logout() {},
  async getCajaAbierta() { return (await database()).getFirstAsync<Caja>("SELECT * FROM cajas WHERE estado = 'abierta' LIMIT 1"); },
  async getNominaciones(cajaId) { return (await database()).getAllAsync<Nominacion>('SELECT * FROM nominaciones WHERE cajaId = ?', cajaId); },
  async abrirCaja(caja) { const id = makeId('caja'); await (await database()).runAsync('INSERT INTO cajas VALUES (?, ?, ?, ?, ?, ?)', id, caja.fechaInicio, caja.fechaCierre, caja.usuarioInicioId, caja.usuarioCierreId, caja.estado); return { id, ...caja }; },
  async cerrarCaja(id, changes) { const db = await database(); await db.runAsync('UPDATE cajas SET fechaCierre = ?, usuarioCierreId = ?, estado = ? WHERE id = ?', changes.fechaCierre, changes.usuarioCierreId, changes.estado, id); return (await db.getFirstAsync<Caja>('SELECT * FROM cajas WHERE id = ?', id))!; },
  async saveNominacion(nominacion, existingId) { const db = await database(); const id = existingId ?? makeId('nom'); if (existingId) await db.runAsync('UPDATE nominaciones SET cajaId = ?, denominacion = ?, cantidad = ?, subtotal = ? WHERE id = ?', nominacion.cajaId, nominacion.denominacion, nominacion.cantidad, nominacion.subtotal, id); else await db.runAsync('INSERT INTO nominaciones VALUES (?, ?, ?, ?, ?)', id, nominacion.cajaId, nominacion.denominacion, nominacion.cantidad, nominacion.subtotal); return { id, ...nominacion }; },
  async getRetiros(cajaId) { return (await database()).getAllAsync<Retiro>('SELECT * FROM retiros WHERE cajaId = ? ORDER BY fecha DESC', cajaId); },
  async getEntradas(cajaId) { return (await database()).getAllAsync<Entrada>('SELECT * FROM entradas WHERE cajaId = ? ORDER BY fecha DESC', cajaId); },
  async crearRetiro(retiro) { const id = makeId('ret'); await (await database()).runAsync('INSERT INTO retiros VALUES (?, ?, ?, ?, ?, ?)', id, retiro.cajaId, retiro.monto, retiro.concepto, retiro.fecha, retiro.usuarioId); return { id, ...retiro }; },
  async crearEntrada(entrada) { const id = makeId('ent'); await (await database()).runAsync('INSERT INTO entradas VALUES (?, ?, ?, ?, ?, ?, ?)', id, entrada.cajaId, entrada.monto, entrada.concepto, entrada.turno, entrada.fecha, entrada.usuarioId); return { id, ...entrada }; },
};
