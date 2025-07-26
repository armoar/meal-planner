import {
	collection,
	getDocs,
	setDoc,
	doc,
	serverTimestamp,
	query,
	orderBy,
	updateDoc,
	deleteDoc
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { MealType } from './types';

const collectionName = 'mealTypes';
const mealTypesRef = collection(db, collectionName);

// ID fijos de las comidas por defecto (coinciden con el 'order')
const protectedMealTypeIds = ['1', '2', '3', '4'];

// Obtener todos los mealTypes ordenados
export async function getAllMealTypes(): Promise<MealType[]> {
	const q = query(mealTypesRef, orderBy('order'));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<MealType, 'id'>) }));
}

// Inicializar comidas por defecto si no existen
export async function initDefaultMealTypes() {
	const defaultMealTypes = [
		{ name: 'Desayuno', order: 1 },
		{ name: 'Almuerzo', order: 2 },
		{ name: 'Cena', order: 3 },
		{ name: 'Snack', order: 4 }
	];

	const snapshot = await getDocs(mealTypesRef);
	const existingNames = snapshot.docs.map((doc) => doc.data().name);

	for (const mt of defaultMealTypes) {
		if (existingNames.includes(mt.name)) continue;

		const newDocRef = doc(mealTypesRef); // ID automático
		await setDoc(newDocRef, {
			...mt,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});
	}
}


// Crear nuevo mealType (máximo 5)
export async function createMealType(name: string, order: number): Promise<void> {
	const newDocRef = doc(mealTypesRef);
	await setDoc(newDocRef, {
		name,
		order,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
}

// Editar nombre y orden
export async function updateMealType(id: string, data: { name: string; order: number }) {
	const ref = doc(mealTypesRef, id);
	await updateDoc(ref, {
		...data,
		updatedAt: serverTimestamp()
	});
}

// Eliminar mealType (solo si no es protegido)
export async function deleteMealType(id: string) {
	if (protectedMealTypeIds.includes(id)) {
		throw new Error('No se puede eliminar un tipo de comida por defecto.');
	}
	const ref = doc(mealTypesRef, id);
	await deleteDoc(ref);
}

// Devolver los IDs protegidos
export function getProtectedMealTypeIds() {
	return [
		'FnogFf6cfTH6uxF9Qkib', // Desayuno
		'AbyFky4XqKyfyhFgIBzv', // Almuerzo
		'YssnWH7OIVU7uBHThAbm', // Cena
		'ZMsSUFbF6HSuGWuPM9U5'  // Snack
	];
}
