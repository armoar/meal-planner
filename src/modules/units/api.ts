// Firebase access functions (CRUD)
import { db } from '$lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Unit } from './types';

const collectionName = 'units';
const collectionRef = collection(db, collectionName);

export async function getAllUnits(): Promise<Unit[]> {
	const snapshot = await getDocs(collectionRef);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data()
	})) as Unit[];
}


export async function createUnit(unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collectionRef, {
    ...unit,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
}

export async function updateUnit(id: string, data: Partial<Unit>): Promise<void> {
	const docRef = doc(db, collectionName, id);
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp()
	});
}

export async function deleteUnit(id: string): Promise<void> {
	const docRef = doc(db, collectionName, id);
	await deleteDoc(docRef);
}

export async function initDefaultUnits() {
  const existing = await getAllUnits();
	if (existing.length > 0) return;

  const defaultUnits: Array<Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>> = [
    { name: 'gramos', symbol: 'g', conversionFactor: 1 },
    { name: 'mililitros', symbol: 'ml', conversionFactor: 1 },
    { name: 'kilogramos', symbol: 'kg', conversionFactor: 1000 },
    { name: 'litros', symbol: 'l', conversionFactor: 1000 },
    { name: 'unidad', symbol: 'ud', conversionFactor: 1 },
    { name: 'cucharada', symbol: 'cda', conversionFactor: 15 },
    { name: 'taza', symbol: 'taza', conversionFactor: 240 },
    { name: 'onzas', symbol: 'oz', conversionFactor: 28.35 }
  ];

  for (const unit of defaultUnits) {
    await createUnit(unit);
  }
}

