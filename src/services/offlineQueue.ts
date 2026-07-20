export type PendingOperation = { id: string; collection: string; documentId: string | null; mode: 'create' | 'update'; payload: string; createdAt: string };
export async function enqueue(_operation: Omit<PendingOperation, 'id' | 'createdAt'>): Promise<never> { throw new Error('La cola SQLite está disponible en Android e iOS.'); }
export async function pendingOperations(): Promise<PendingOperation[]> { return []; }
export async function removeOperation(_id: string) {}
