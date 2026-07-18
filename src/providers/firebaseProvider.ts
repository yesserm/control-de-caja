import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, initializeAuth, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where, type Firestore } from 'firebase/firestore';
import type { Caja, Entrada, Nominacion, Retiro } from '../types/models';
import type { DataProvider } from './types';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
let authInstance: Auth | undefined;

function services(): { app: FirebaseApp; db: Firestore } {
  if (Object.values(config).some((value) => !value)) throw new Error('Configura todas las variables EXPO_PUBLIC_FIREBASE_* para usar Firebase.');
  const app = getApps().length ? getApp() : initializeApp(config);
  return { app, db: getFirestore(app) };
}

function firebaseAuth(app: FirebaseApp) {
  if (!authInstance) {
    try { authInstance = initializeAuth(app, { persistence: inMemoryPersistence }); }
    catch { authInstance = getAuth(app); }
  }
  return authInstance;
}

async function documents<T extends { id: string }>(db: Firestore, name: string, field: string, value: string): Promise<T[]> {
  const snapshot = await getDocs(query(collection(db, name), where(field, '==', value)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T));
}

export const firebaseProvider: DataProvider = {
  async authenticate(email, password) {
    const { app, db } = services();
    const credential = await signInWithEmailAndPassword(firebaseAuth(app), email, password);
    const profile = await getDoc(doc(db, 'users', credential.user.uid));
    if (!profile.exists()) throw new Error('La cuenta no tiene un perfil de caja configurado.');
    const data = profile.data();
    return { id: credential.user.uid, email: credential.user.email ?? email, name: String(data.name), role: data.role === 'admin' ? 'admin' : 'user' };
  },
  async logout() { const { app } = services(); await signOut(firebaseAuth(app)); },
  async getCajaAbierta() { const { db } = services(); return (await documents<Caja>(db, 'cajas', 'estado', 'abierta'))[0] ?? null; },
  async getNominaciones(cajaId) { const { db } = services(); return documents<Nominacion>(db, 'nominaciones', 'cajaId', cajaId); },
  async abrirCaja(caja) { const { db } = services(); const created = await addDoc(collection(db, 'cajas'), caja); return { id: created.id, ...caja }; },
  async cerrarCaja(id, changes) { const { db } = services(); await updateDoc(doc(db, 'cajas', id), changes); const saved = await getDoc(doc(db, 'cajas', id)); return { id, ...saved.data() } as Caja; },
  async saveNominacion(nominacion, id) { const { db } = services(); if (id) { await updateDoc(doc(db, 'nominaciones', id), nominacion); return { id, ...nominacion }; } const created = await addDoc(collection(db, 'nominaciones'), nominacion); return { id: created.id, ...nominacion }; },
  async getRetiros(cajaId) { const { db } = services(); return documents<Retiro>(db, 'retiros', 'cajaId', cajaId); },
  async getEntradas(cajaId) { const { db } = services(); return documents<Entrada>(db, 'entradas', 'cajaId', cajaId); },
  async crearRetiro(retiro) { const { db } = services(); const created = await addDoc(collection(db, 'retiros'), retiro); return { id: created.id, ...retiro }; },
  async crearEntrada(entrada) { const { db } = services(); const created = await addDoc(collection(db, 'entradas'), entrada); return { id: created.id, ...entrada }; },
};
