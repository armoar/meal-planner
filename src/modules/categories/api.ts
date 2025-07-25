import {
	collection,
	addDoc,
	doc,
	getDocs,
	updateDoc,
	deleteDoc,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Category } from './types';

const COLLECTION_NAME = 'categories';

export async function getAllCategories(): Promise<Category[]> {
	const snapshot = await getDocs(collection(db, COLLECTION_NAME));
	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}) as Category);
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const docRef = await addDoc(collection(db, COLLECTION_NAME), {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return docRef.id;
}

export async function updateCategory(id: string, data: Partial<Category>) {
	await updateDoc(doc(db, COLLECTION_NAME, id), {
		...data,
		updatedAt: serverTimestamp(),
	});
}

export async function deleteCategory(id: string) {
	await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function initDefaultCategories() {
	const existing = await getAllCategories();
	if (existing.length > 0) return;

	const defaults = [
		{ name: 'Carnes', icon: '🥩', color: '#ffa8a8' },
		{ name: 'Frutas', icon: '🍎', color: '#b3fff6' },
		{ name: 'Verduras', icon: '🥕', color: '#c9f099' },
		{ name: 'Mariscos', icon: '🦐', color: '#ff9f75' },
		{ name: 'Pasta y arroz', icon: '🍚', color: '#fff799' },
		{ name: 'Lácteos y huevo', icon: '🥛', color: '#e6e6e6' },
		{ name: 'Legumbres', icon: '🍲', color: '#ffd285' },
		{ name: 'Conservas', icon: '🥫', color: '#ddeff8' },
		{ name: 'Frutos secos', icon: '🥜', color: '#f4e5ae' },
		{ name: 'Pescados', icon: '🐟', color: '#85d0ff' },
		{ name: 'Congelados', icon: '❄️', color: '#5cabff' },
		{ name: 'Alimentación', icon: '🍿', color: '#ffd6f5' },
	];

	for (const cat of defaults) {
		await createCategory(cat);
	}
}
