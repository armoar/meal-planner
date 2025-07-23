// Firebase access functions (CRUD)
import { db } from '$lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import type { Unit } from './types';

export const unitsCollection = collection(db, 'units');

export async function createUnit(unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) {
  await addDoc(unitsCollection, {
    ...unit,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function initDefaultUnits() {
  const snapshot = await getDocs(unitsCollection);
  if (!snapshot.empty) return; // Si ya hay unidades, no hacemos nada

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