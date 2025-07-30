import type { Timestamp } from 'firebase/firestore';

export interface RecipeIngredient {
	foodId: string;
	quantity: number; // cantidad total para toda la receta
	unit: string;
}

export interface Recipe {
	id: string;
	name: string;
	servings: number; // nº de porciones en las que se divide la receta
	ingredients: RecipeIngredient[];
	totalCalories: number;
	totalProteins: number;
	totalCarbs: number;
	totalFat: number;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
