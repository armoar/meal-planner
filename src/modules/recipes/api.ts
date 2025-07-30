import {
	collection,
	addDoc,
	updateDoc,
	doc,
	deleteDoc,
	getDocs,
	serverTimestamp,
	query,
	orderBy,
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Recipe } from './types';

const COLLECTION_NAME = 'recipes';

export async function getAllRecipes(): Promise<Recipe[]> {
	const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}) as Recipe);
}

export async function createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const docRef = await addDoc(collection(db, COLLECTION_NAME), {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
	return docRef.id;
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<void> {
	const docRef = doc(db, COLLECTION_NAME, id);
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp()
	});
}

export async function deleteRecipe(id: string): Promise<void> {
	const docRef = doc(db, COLLECTION_NAME, id);
	await deleteDoc(docRef);
}

// Opcional: inicializar recetas por defecto
export async function initDefaultRecipes(): Promise<void> {
	// Aquí podrías crear recetas de ejemplo
}
