// src/modules/weeklyPlans/types.ts
import type { Timestamp, FieldValue } from 'firebase/firestore';

/** Permite leer (Timestamp) y escribir (FieldValue: serverTimestamp()) */
export type FirestoreTime = Timestamp | FieldValue;

/** Participación de cada comensal en una semana */
export interface WeeklyPlanDiner {
  dinerId: string;
  included: boolean; // true si participa en esa semana
}

export interface WeeklyPlan {
  id: string;
  startDate: string; // YYYY-MM-DD (siempre lunes)
  endDate: string;   // YYYY-MM-DD (siempre domingo)
  diners: WeeklyPlanDiner[]; // participantes de la semana
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface DailyPlan {
  id: string;
  weeklyPlanId: string;
  date: string;      // YYYY-MM-DD
  dayOfWeek: number; // 1=lunes ... 7=domingo
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
  // Otros campos si son necesarios a nivel de día (ej: notas)
}

export interface Meal {
  id: string;
  dailyPlanId: string;

  // Tipo de comida (Desayuno, Almuerzo, etc.)
  mealTypeId: string;

  // Asociación a Food o Recipe
  foodId?: string;
  recipeId?: string;

  // Cantidad base del meal (si aplica al alimento o receta principal)
  quantity: number;
  unitId?: string;

  /** Config por comensal en este meal */
  diners: {
    dinerId: string;
    quantity: number;  // cantidad específica para este comensal
    excluded: boolean; // si este comensal está excluido del meal
  }[];

  // Denormalizados para render rápido
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;

  // Campos adicionales para recetas
  recipeMode?: 'portions' | 'totalWeight' | 'custom';

  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

/** Vistas en memoria para la UI (incluye semanas virtuales) */
export interface DailyPlanView extends DailyPlan {
  meals: Meal[];
}

/**
 * Para la UI, simplificamos diners a IDs incluidos.
 * (En persistencia WeeklyPlan.diners mantiene {dinerId,included}.)
 */
export interface WeeklyPlanView {
  id: string;
  startDate: string;
  endDate: string;

  /** IDs de comensales incluidos (included=true) para esta semana */
  diners: string[];

  createdAt: Timestamp; // al leer desde Firestore ya son Timestamp
  updatedAt: Timestamp;

  dailyPlans: DailyPlanView[];
  isVirtual: boolean; // true si la semana aún no está persistida
}
