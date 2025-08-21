import {
  addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Meal } from './types';
import { getDailyPlansByWeeklyPlanId } from '$modules/dailyPlans/api';

const MEALS = 'meals';

export async function createMeal(input: Omit<Meal,'id'|'createdAt'|'updatedAt'>): Promise<{ id: string }> {
  const ref = await addDoc(collection(db, MEALS), { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id: ref.id };
}

export async function updateMeal(
  id: string, patch: Partial<Omit<Meal,'id'|'createdAt'|'updatedAt'>>
): Promise<void> {
  await updateDoc(doc(db, MEALS, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteMeal(id: string): Promise<void> {
  await deleteDoc(doc(db, MEALS, id));
}

export async function listMealsByDailyPlanId(dailyPlanId: string): Promise<Meal[]> {
  const q = query(collection(db, MEALS), where('dailyPlanId', '==', dailyPlanId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Meal,'id'>) }));
}

export async function listMealsByWeeklyPlanId(weeklyPlanId: string): Promise<Meal[]> {
  const dailyPlans = await getDailyPlansByWeeklyPlanId(weeklyPlanId);
  const all: Meal[] = [];
  for (const dp of dailyPlans) {
    const meals = await listMealsByDailyPlanId(dp.id);
    all.push(...meals);
  }
  return all;
}
