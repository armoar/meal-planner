// src/modules/weeklyPlans/types.ts
import type { Timestamp, FieldValue } from 'firebase/firestore';
import type { DailyPlan } from '$modules/dailyPlans/types';
import type { Meal } from '$modules/meals/types';

export type FirestoreTime = Timestamp | FieldValue;

export interface WeeklyPlanDiner {
  dinerId: string;
  included: boolean;
}

export interface WeeklyPlan {
  id: string;
  startDate: string; // 'YYYY-MM-DD' (lunes)
  endDate: string;   // 'YYYY-MM-DD' (domingo)
  diners: WeeklyPlanDiner[];
  createdAt: FirestoreTime;
  updatedAt: FirestoreTime;
}

export interface DailyPlanView extends DailyPlan {
  meals: Meal[];
}

export interface WeeklyPlanView {
  id: string;
  startDate: string;
  endDate: string;
  diners: string[]; // IDs incluidos
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dailyPlans: DailyPlanView[];
}
