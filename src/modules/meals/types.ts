import type { FieldValue, Timestamp } from 'firebase/firestore';
export type FirestoreTime = Timestamp | FieldValue;

export interface MealDinerConfig {
  dinerId: string;
  quantity: number;
  excluded: boolean;
}

export interface Meal {
  id: string;

  dailyPlanId: string;
  mealTypeId: string;

  foodId?: string;
  recipeId?: string;
  quantity: number;
  unitId?: string;

  diners: MealDinerConfig[];

  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;

  recipeMode?: 'portions' | 'totalWeight' | 'custom';
  
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}
