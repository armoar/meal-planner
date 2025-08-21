import {
  addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where, updateDoc, orderBy
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { DailyPlan } from './types';

const DAILY_PLANS = 'dailyPlans';

export async function createDailyPlan(
  weeklyPlanId: string, date: string, dayOfWeek: number
): Promise<{ id: string }> {
  const ref = await addDoc(collection(db, DAILY_PLANS), {
    weeklyPlanId, date, dayOfWeek, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  return { id: ref.id };
}

export async function updateDailyPlan(
  id: string, patch: Partial<Omit<DailyPlan, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await updateDoc(doc(db, DAILY_PLANS, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteDailyPlan(id: string): Promise<void> {
  await deleteDoc(doc(db, DAILY_PLANS, id));
}

export async function getDailyPlansByWeeklyPlanId(weeklyPlanId: string): Promise<DailyPlan[]> {
  const q = query(collection(db, DAILY_PLANS), where('weeklyPlanId', '==', weeklyPlanId), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DailyPlan, 'id'>) }));
}
