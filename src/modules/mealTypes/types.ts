import type { Timestamp } from 'firebase/firestore';

export interface MealType {
	id: string;
	name: string;
	order: number;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
