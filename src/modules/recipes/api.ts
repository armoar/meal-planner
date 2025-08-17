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
	where,
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Recipe } from './types';

const collectionName = 'recipes';

export async function getAllRecipes(): Promise<Recipe[]> {
	const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}) as Recipe);
}

export async function getRecipesByIds(ids: string[]): Promise<Recipe[]> {
    if (ids.length === 0) return [];

     // Manejar el límite de 10 en la cláusula 'in' si es necesario
    if (ids.length > 10) {
         console.warn("getRecipesByIds: Array of IDs exceeds Firestore 'in' limit (10). Consider chunking.");
         // Implementar lógica de chunking aquí si es necesario
         ids = ids.slice(0, 10);
    }

     const q = query(collection(db, collectionName), where('id', 'in', ids));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Recipe[];
}

export async function createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const docRef = await addDoc(collection(db, collectionName), {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
	return docRef.id;
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<void> {
	const docRef = doc(db, collectionName, id);
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp()
	});
}

export async function deleteRecipe(id: string): Promise<void> {
	const docRef = doc(db, collectionName, id);
	await deleteDoc(docRef);
}

// Opcional: inicializar recetas por defecto
export async function initDefaultRecipes(): Promise<void> {
	// Aquí podrías crear recetas de ejemplo
}
