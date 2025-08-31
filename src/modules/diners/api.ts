import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Diner } from './types';

const collectionName = 'diners';
const collectionRef = collection(db, collectionName);

// Obtener todos los comensales
export async function getAllDiners(): Promise<Diner[]> {
    const snapshot = await getDocs(collectionRef);
    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<Diner, 'id'>;
      return { id: docSnap.id, ...data };
    });
    // opcional: filtra registros sin name para evitar problemas
    return items.filter((d) => typeof (d as any).name === 'string' && (d as any).name.trim().length > 0) as Diner[];
  }

// Crear un nuevo comensal
export async function createDiner(data: Omit<Diner, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return docRef.id;
}


// Actualizar un comensal existente
export async function updateDiner(id: string, data: Partial<Diner>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

// Eliminar un comensal
export async function deleteDiner(id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
}

// (Opcional) Crear datos por defecto
export async function initDefaultDiners(): Promise<void> {
    const existing = await getAllDiners();
    if (existing.length > 0) return;

    await Promise.all([
        createDiner({ name: 'Arturo' }),
        createDiner({ name: 'Paco' }),
        createDiner({ name: 'Isabel' })
    ]);
}
