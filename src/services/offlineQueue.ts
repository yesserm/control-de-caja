export type PendingOperation = { id: string; collection: string; documentId: string | null; mode: 'create' | 'update'; payload: string; createdAt: string };
export async function enqueue(): Promise<never> { throw new Error('La cola SQLite está disponible en Android e iOS.'); }
export async function pendingOperations(): Promise<PendingOperation[]> { return []; }
export async function removeOperation() {}
