// src/modules/dailyPlans/types.ts
import type { FieldValue, Timestamp } from 'firebase/firestore';

export type FirestoreTime = Timestamp | FieldValue;

export interface DailyPlan {
  id: string;
  weeklyPlanId: string;
  date: string;      // YYYY-MM-DD
  dayOfWeek: number; // 1..7 (1=lunes, 7=domingo)
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
}
