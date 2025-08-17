import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	serverTimestamp,
	query,
	where
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Food } from './types';

const collectionName = 'foods';
const collectionRef = collection(db, collectionName);

// Obtener todos los alimentos
export async function getAllFoods(): Promise<Food[]> {
	const snapshot = await getDocs(collectionRef);
	return snapshot.docs.map((docSnap) => ({
		id: docSnap.id,
		...docSnap.data()
	})) as Food[];
}

export async function getFoodsByIds(ids: string[]): Promise<Food[]> {
    if (ids.length === 0) return [];

    // Manejar el límite de 10 en la cláusula 'in' si es necesario
    // Si el array 'ids' puede tener más de 10 elementos, deberás dividirlo en chunks
    // y realizar múltiples consultas. Para empezar, asumimos que no excede el límite.
    if (ids.length > 10) {
         console.warn("getFoodsByIds: Array of IDs exceeds Firestore 'in' limit (10). Consider chunking.");
         // Implementar lógica de chunking aquí si es necesario
         // Por ahora, solo tomamos los primeros 10 para evitar errores
         ids = ids.slice(0, 10);
    }

    const q = query(collection(db, collectionName), where('id', 'in', ids));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Food[];
}

// Crear un nuevo alimento
export async function createFood(data: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
	const docRef = await addDoc(collectionRef, {
		...data,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
	return docRef.id;
}

// Actualizar un alimento existente
export async function updateFood(id: string, data: Partial<Food>): Promise<void> {
	const docRef = doc(db, collectionName, id);
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp()
	});
}

// Eliminar un alimento
export async function deleteFood(id: string): Promise<void> {
	const docRef = doc(db, collectionName, id);
	await deleteDoc(docRef);
}

export async function initDefaultFoods(): Promise<void> {
	const existing = await getAllFoods();
	if (existing.length > 0) return;

	await Promise.all([
		createFood({
			name: 'Pechuga de pollo',
			categoryId: 'rYSfY5pZHng8cBrhqhm9',
			categoryName: 'Carnes',
			categoryIcon: '🥩',
			categoryColor: '#ffa8a8',
			calories: 165,
			proteins: 31,
			carbs: 0,
			fat: 3.6
		}),
		createFood({
			name: 'Gambas',
			categoryId: 'ydvtvO5v4oS2hyuj0bvg',
			categoryName: 'Mariscos',
			categoryIcon: '🦐',
			categoryColor: '#fbbda2',
			calories: 99,
			proteins: 24,
			carbs: 0.2,
			fat: 0.3
		}),
		createFood({
			name: 'Manzana',
			categoryId: '3FdyrMzUP0u1oqOVLOpi',
			categoryName: 'Frutas',
			categoryIcon: '🍎',
			categoryColor: '#b2f5d6',
			calories: 52,
			proteins: 0.3,
			carbs: 13.8,
			fat: 0.2
		}),
		createFood({
			name: 'Zanahoria',
			categoryId: 'q16siXiqzJ2Su5rmY5UV',
			categoryName: 'Verduras',
			categoryIcon: '🥕',
			categoryColor: '#c9f099',
			calories: 41,
			proteins: 0.9,
			carbs: 9.6,
			fat: 0.2
		}),
		createFood({
			name: 'Arroz blanco cocido',
			categoryId: 'BYg2Ks1bK59CSTKxnPJY',
			categoryName: 'Pasta y arroz',
			categoryIcon: '🍚',
			categoryColor: '#fff799',
			calories: 130,
			proteins: 2.7,
			carbs: 28.2,
			fat: 0.3
		}),
		createFood({
			name: 'Lentejas cocidas',
			categoryId: 'nRxktEcEYowM1PBbsKle',
			categoryName: 'Legumbres',
			categoryIcon: '🍲',
			categoryColor: '#ffd285',
			calories: 116,
			proteins: 9,
			carbs: 20,
			fat: 0.4
		}),
		createFood({
			name: 'Huevo cocido',
			categoryId: 'TncLlIjh4PLIHnCADTVc',
			categoryName: 'Lácteos y huevo',
			categoryIcon: '🥛',
			categoryColor: '#e6e6e6',
			calories: 155,
			proteins: 13,
			carbs: 1.1,
			fat: 11
		}),
		createFood({
			name: 'Salmón cocido',
			categoryId: 'N0Ris3DQDO1bjkXeafaQ',
			categoryName: 'Pescados',
			categoryIcon: '🐟',
			categoryColor: '#85d0ff',
			calories: 206,
			proteins: 22,
			carbs: 0,
			fat: 13
		}),
		createFood({
			name: 'Almendras',
			categoryId: 'Wt3ugfANyVaNlpWvOTna',
			categoryName: 'Frutos secos',
			categoryIcon: '🥜',
			categoryColor: '#f4e5ae',
			calories: 579,
			proteins: 21,
			carbs: 22,
			fat: 50
		}),
		createFood({
			name: 'Atún en conserva (agua)',
			categoryId: 'Y7Z8OBABlP0mKI1m2o4j',
			categoryName: 'Conservas',
			categoryIcon: '🥫',
			categoryColor: '#ddeff8',
			calories: 96,
			proteins: 22,
			carbs: 0,
			fat: 1
		}),
		createFood({
			name: 'Guisantes congelados',
			categoryId: 'IpR0YBlHdZ8R0vWR0gO8',
			categoryName: 'Congelados',
			categoryIcon: '❄️',
			categoryColor: '#a4cdf9',
			calories: 84,
			proteins: 5,
			carbs: 15,
			fat: 0.4
		}),
		createFood({
			name: 'Palomitas sin grasa',
			categoryId: 'sjT6x312vSoHGqwieEGn',
			categoryName: 'Alimentación',
			categoryIcon: '🍿',
			categoryColor: '#ffd6f5',
			calories: 387,
			proteins: 13,
			carbs: 78,
			fat: 4.5
		})
	]);
}


