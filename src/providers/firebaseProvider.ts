import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, inMemoryPersistence, initializeAuth, signInWithCredential, signInWithEmailAndPassword, signOut, type Auth, type User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, writeBatch, type Firestore, type QueryConstraint } from 'firebase/firestore';
import type { Caja, CompanySettings, Entrada, HistoryItem, HistoryKind, Nominacion, Retiro, User } from '../types/models';
import type { DataProvider } from './types';

const DEFAULT_COMPANY: CompanySettings = { empresaNombre: 'Parada Caribe' };
const config = { apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID };
let authInstance: Auth | undefined;

function services(): { app: FirebaseApp; db: Firestore } {
  if (Object.values(config).some((value) => !value)) throw new Error('Configura todas las variables EXPO_PUBLIC_FIREBASE_* para usar Firebase.');
  const app = getApps().length ? getApp() : initializeApp(config);
  return { app, db: getFirestore(app) };
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
  async abrirCaja(caja) { const created = await addDoc(collection(services().db, 'cajas'), caja); return { id: created.id, ...caja }; },
  async cerrarCaja(id, changes) { const { db } = services(); await updateDoc(doc(db, 'cajas', id), changes); return { id, ...(await getDoc(doc(db, 'cajas', id))).data() } as Caja; },
  async saveNominacion(nominacion, id) { const { db } = services(); if (id) { await updateDoc(doc(db, 'nominaciones', id), nominacion); return { id, ...nominacion }; } const created = await addDoc(collection(db, 'nominaciones'), nominacion); return { id: created.id, ...nominacion }; },
  async getRetiros(cajaId) { return documents<Retiro>(services().db, 'retiros', [where('cajaId', '==', cajaId)]); },
  async getEntradas(cajaId) { return documents<Entrada>(services().db, 'entradas', [where('cajaId', '==', cajaId)]); },
  async crearRetiro(retiro) { const created = await addDoc(collection(services().db, 'retiros'), retiro); return { id: created.id, ...retiro }; },
  async crearEntrada(entrada) { const created = await addDoc(collection(services().db, 'entradas'), entrada); return { id: created.id, ...entrada }; },
};
