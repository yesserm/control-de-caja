import * as SQLite from 'expo-sqlite';

export type PendingOperation = { id: string; collection: string; documentId: string | null; mode: 'create' | 'update'; payload: string; createdAt: string };
let dbPromise: Promise<SQLite.SQLiteDatabase> | undefined;
async function database() { if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('control-de-caja.db').then(async (db) => { await db.execAsync('CREATE TABLE IF NOT EXISTS sync_queue (id TEXT PRIMARY KEY NOT NULL, collection TEXT NOT NULL, documentId TEXT, mode TEXT NOT NULL, payload TEXT NOT NULL, createdAt TEXT NOT NULL)'); return db; }); return dbPromise; }
export async function enqueue(operation: Omit<PendingOperation, 'id' | 'createdAt'>) { const id = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; const createdAt = new Date().toISOString(); await (await database()).runAsync('INSERT INTO sync_queue VALUES (?, ?, ?, ?, ?, ?)', id, operation.collection, operation.documentId, operation.mode, operation.payload, createdAt); return { id, ...operation, createdAt }; }
export async function pendingOperations() { return (await (await database()).getAllAsync<PendingOperation>('SELECT * FROM sync_queue ORDER BY createdAt')); }
export async function removeOperation(id: string) { await (await database()).runAsync('DELETE FROM sync_queue WHERE id = ?', id); }
