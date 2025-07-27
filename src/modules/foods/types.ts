import { Timestamp } from 'firebase/firestore';

export interface Food {
	id: string;
	name: string;
	categoryId: string;
	categoryName: string;
    categoryColor: string;
	categoryIcon: string;
    calories: number;
	proteins: number;
	carbs: number;
	fat: number;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}