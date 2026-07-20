import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { GoogleAuthProvider, getAuth, inMemoryPersistence, initializeAuth, signInWithCredential, signInWithEmailAndPassword, signOut, type Auth, type User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager, query, setDoc, updateDoc, where, writeBatch, type Firestore, type QueryConstraint } from 'firebase/firestore';
import type { Caja, CompanySettings, Entrada, HistoryItem, HistoryKind, Nominacion, Retiro, User } from '../types/models';
import type { DataProvider } from './types';
import { enqueue, pendingOperations, removeOperation } from '../services/offlineQueue';

const DEFAULT_COMPANY: CompanySettings = { empresaNombre: 'Parada Caribe' };
const config = { apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID };
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

function services(): { app: FirebaseApp; db: Firestore } {
  if (Object.values(config).some((value) => !value)) throw new Error('Configura todas las variables EXPO_PUBLIC_FIREBASE_* para usar Firebase.');
  const app = getApps().length ? getApp() : initializeApp(config);
  if (!firestoreInstance) {
    if (Platform.OS === 'web') {
      try { firestoreInstance = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }) }); }
      catch { firestoreInstance = getFirestore(app); }
    } else firestoreInstance = getFirestore(app);
  }
  return { app, db: firestoreInstance };
}

function firebaseAuth(app: FirebaseApp) {
  if (!authInstance) {
    try { authInstance = initializeAuth(app, { persistence: inMemoryPersistence }); } catch { authInstance = getAuth(app); }
  }
  return authInstance;
}

function toUser(id: string, data: Record<string, unknown>, email: string): User {
  return { id, email, name: String(data.name ?? 'Usuario'), role: data.role === 'admin' ? 'admin' : 'user', empresaNombre: typeof data.empresaNombre === 'string' ? data.empresaNombre : undefined };
}

async function companySettings(db: Firestore): Promise<CompanySettings> {
  const snapshot = await getDoc(doc(db, 'settings', 'general'));
  return snapshot.exists() ? { empresaNombre: String(snapshot.data().empresaNombre ?? DEFAULT_COMPANY.empresaNombre) } : DEFAULT_COMPANY;
}

async function profile(db: Firestore, firebaseUser: FirebaseUser, createWhenMissing: boolean): Promise<User> {
  const reference = doc(db, 'users', firebaseUser.uid);
  const existing = await getDoc(reference);
  if (!existing.exists()) {
    if (!createWhenMissing) throw new Error('La cuenta no tiene un perfil de caja configurado.');
    const settings = await companySettings(db);
    const data = { name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Usuario', role: 'user', empresaNombre: settings.empresaNombre, email: firebaseUser.email ?? '' };
    await setDoc(reference, data);
    return toUser(firebaseUser.uid, data, firebaseUser.email ?? '');
  }
  return toUser(firebaseUser.uid, existing.data(), firebaseUser.email ?? '');
}

async function documents<T extends { id: string }>(db: Firestore, name: string, clauses: QueryConstraint[]): Promise<T[]> {
  const snapshot = await getDocs(query(collection(db, name), ...clauses));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T));
}

async function writeOrQueue<T>(collectionName: string, id: string, value: T, mode: 'create' | 'update') {
  const { db } = services();
  const payload = value as Record<string, unknown>;
  try { if (mode === 'create') await setDoc(doc(db, collectionName, id), payload); else await updateDoc(doc(db, collectionName, id), payload); }
  catch { await enqueue({ collection: collectionName, documentId: id, mode, payload: JSON.stringify(value) }); }
}

export async function flushOfflineQueue() {
  const { db } = services();
  for (const operation of await pendingOperations()) {
    const reference = doc(db, operation.collection, operation.documentId!);
    const payload = JSON.parse(operation.payload) as Record<string, unknown>;
    if (operation.mode === 'create') await setDoc(reference, payload); else await updateDoc(reference, payload);
    await removeOperation(operation.id);
  }
}
NetInfo.addEventListener((state) => { if (state.isConnected && state.isInternetReachable !== false) void flushOfflineQueue().catch(() => undefined); });

export const firebaseProvider: DataProvider = {
  async authenticate(email, password) {
    const { app, db } = services();
    const credential = await signInWithEmailAndPassword(firebaseAuth(app), email, password);
    return profile(db, credential.user, false);
  },
  async authenticateWithGoogle(idToken) {
    const { app, db } = services();
    const credential = await signInWithCredential(firebaseAuth(app), GoogleAuthProvider.credential(idToken));
    return profile(db, credential.user, true);
  },
  async logout() { const { app } = services(); await signOut(firebaseAuth(app)); },
  async getCajaAbierta(user) {
    const clauses: QueryConstraint[] = [where('estado', '==', 'abierta')];
    if (user?.role === 'user') clauses.push(where('usuarioAsignadoId', '==', user.id));
    return (await documents<Caja>(services().db, 'cajas', clauses))[0] ?? null;
  },
  async getUsers() {
    const { db } = services();
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((item) => toUser(item.id, item.data(), String(item.data().email ?? ''))).sort((left, right) => left.name.localeCompare(right.name));
  },
  async getCompanySettings() { return companySettings(services().db); },
  async updateCompanyName(empresaNombre) {
    const { db } = services();
    const users = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    batch.set(doc(db, 'settings', 'general'), { empresaNombre }, { merge: true });
    users.docs.forEach((item) => batch.update(item.ref, { empresaNombre }));
    await batch.commit();
    return { empresaNombre };
  },
  async updateUserRole(id, role) {
    const { db } = services();
    await updateDoc(doc(db, 'users', id), { role });
    const saved = await getDoc(doc(db, 'users', id));
    return toUser(id, saved.data() ?? {}, String(saved.data()?.email ?? ''));
  },
  async getHistory(kind: HistoryKind): Promise<HistoryItem[]> { const snapshot = await getDocs(collection(services().db, kind)); return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as HistoryItem)); },
  async getNominaciones(cajaId) { return documents<Nominacion>(services().db, 'nominaciones', [where('cajaId', '==', cajaId)]); },
  async abrirCaja(caja) { const id = doc(collection(services().db, 'cajas')).id; await writeOrQueue('cajas', id, caja, 'create'); return { id, ...caja }; },
  async cerrarCaja(id, changes) { await writeOrQueue('cajas', id, changes, 'update'); return { id, ...(await getDoc(doc(services().db, 'cajas', id))).data(), ...changes } as Caja; },
  async saveNominacion(nominacion, id) { const savedId = id ?? doc(collection(services().db, 'nominaciones')).id; await writeOrQueue('nominaciones', savedId, nominacion, id ? 'update' : 'create'); return { id: savedId, ...nominacion }; },
  async getRetiros(cajaId) { return documents<Retiro>(services().db, 'retiros', [where('cajaId', '==', cajaId)]); },
  async getEntradas(cajaId) { return documents<Entrada>(services().db, 'entradas', [where('cajaId', '==', cajaId)]); },
  async crearRetiro(retiro) { const id = doc(collection(services().db, 'retiros')).id; await writeOrQueue('retiros', id, retiro, 'create'); return { id, ...retiro }; },
  async crearEntrada(entrada) { const id = doc(collection(services().db, 'entradas')).id; await writeOrQueue('entradas', id, entrada, 'create'); return { id, ...entrada }; },
};
