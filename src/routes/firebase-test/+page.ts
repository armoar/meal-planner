// src/routes/firebase-test/+page.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Unit } from '$modules/units/types';

export async function load() {
  try {
    const querySnapshot = await getDocs(collection(db, 'units'));
    const units: Unit[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Unit[];

    return { units };
  } catch (error) {
    console.error('Error al leer la colección units:', error);
    return { units: [] };
  }
}
