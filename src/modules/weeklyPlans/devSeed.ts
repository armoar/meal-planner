// src/modules/weeklyPlans/devSeed.ts
// DEV-ONLY: seed de WeeklyPlans y utilidades de borrado en cascada (meals → dailyPlans → weeklyPlans)

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import { createWeeklyPlan } from '$modules/weeklyPlans/api';
import { getAllDiners } from '$modules/diners/api';
import { getAllMealTypes } from '$modules/mealTypes/api';

const WEEKLY_PLANS = 'weeklyPlans';
const DAILY_PLANS = 'dailyPlans';
const MEALS = 'meals';

// ======== helpers batch ========
const BATCH_LIMIT = 450; // margen por seguridad (<500)

async function commitBatchWithLimit(acc: { batch: ReturnType<typeof writeBatch>; ops: number }) {
  if (acc.ops >= BATCH_LIMIT) {
    await acc.batch.commit();
    acc.batch = writeBatch(db);
    acc.ops = 0;
  }
}

async function flushBatch(acc: { batch: ReturnType<typeof writeBatch>; ops: number }) {
  if (acc.ops > 0) {
    await acc.batch.commit();
    acc.batch = writeBatch(db);
    acc.ops = 0;
  }
}

// ======== helpers de fecha (UTC, sin dependencias) ========
function toYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}
function addDaysUTC(d: Date, days: number): Date {
  const nd = new Date(d);
  nd.setUTCDate(nd.getUTCDate() + days);
  return nd;
}
function firstOfMonthUTC(year: number, monthIdx: number): Date {
  return new Date(Date.UTC(year, monthIdx, 1));
}
function nextMonthUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}
function allMondaysOfMonth(year: number, monthIdx: number): Date[] {
  const d1 = firstOfMonthUTC(year, monthIdx);
  const w = d1.getUTCDay(); // 0..6
  const offset = w === 0 ? 1 : w === 1 ? 0 : 8 - w;
  let firstMonday = addDaysUTC(d1, offset);
  const mondays: Date[] = [];
  const limit = nextMonthUTC(d1);
  while (firstMonday < limit) {
    mondays.push(firstMonday);
    firstMonday = addDaysUTC(firstMonday, 7);
  }
  return mondays;
}

/**
 * Inserta algunos meals dummy en L/M/V para todos los comensales.
 */
async function insertDummyMealsForWeek(
  weeklyPlanId: string,
  dinerIds: string[],
  mealTypes: Array<{ id: string; name: string }>
) {
  const dpsQ = query(collection(db, DAILY_PLANS), where('weeklyPlanId', '==', weeklyPlanId));
  const dpsSnap = await getDocs(dpsQ);

  const dpByDate = new Map<string, string>();
  dpsSnap.forEach((docu) => {
    const data = docu.data() as any;
    dpByDate.set(data.date, docu.id);
  });

  const mtBreakfast = mealTypes.find((m) => /desayuno/i.test(m.name)) ?? mealTypes[0];
  const mtLunch =
    mealTypes.find((m) => /almuerzo|comida/i.test(m.name)) ?? mealTypes[1] ?? mealTypes[0];
  const mtDinner = mealTypes.find((m) => /cena/i.test(m.name)) ?? mealTypes[2] ?? mealTypes[0];

  const datesSorted = [...dpByDate.keys()].sort();
  if (datesSorted.length === 0) return;

  const monday = new Date(datesSorted[0] + 'T00:00:00Z');
  const dates = Array.from({ length: 7 }, (_, i) => toYMD(addDaysUTC(monday, i)));

  const planMeals: Array<{ dayIdx: number; mealTypeId: string; name: string; kcal: number }> = [
    { dayIdx: 0, mealTypeId: mtBreakfast.id, name: 'Tostadas integrales', kcal: 250 },
    { dayIdx: 2, mealTypeId: mtLunch.id, name: 'Pasta con verduras', kcal: 600 },
    { dayIdx: 4, mealTypeId: mtDinner.id, name: 'Ensalada de pollo', kcal: 450 }
  ];

  for (const pm of planMeals) {
    const dateYMD = dates[pm.dayIdx];
    const dailyPlanId = dpByDate.get(dateYMD);
    if (!dailyPlanId) continue;

    await addDoc(collection(db, MEALS), {
      dailyPlanId,
      mealTypeId: pm.mealTypeId,
      name: pm.name,
      quantity: 1,
      unitId: 'ud',
      calories: pm.kcal,
      proteins: Math.round(pm.kcal * 0.15),
      carbs: Math.round(pm.kcal * 0.55),
      fat: Math.round(pm.kcal * 0.3),
      diners: dinerIds.map((id) => ({ dinerId: id, quantity: 1, excluded: false })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * CREA TODO EL SEED:
 * - 2025: 3 semanas por mes.
 * - 2024: 3 semanas (feb, jun, oct).
 * - 2023: 2 semanas (mar, nov).
 */
export async function seedAllWeeklyPlansDev(): Promise<{ created: string[]; byYear: Record<string, string[]>; }> {
  const diners = await getAllDiners();
  const mealTypes = await getAllMealTypes();

  if (diners.length === 0) throw new Error('No hay comensales en la BD. Crea al menos uno antes de ejecutar el seed.');
  if (mealTypes.length === 0) throw new Error('No hay mealTypes en la BD. Crea los tipos por defecto antes del seed.');

  const dinerIds = diners.map((d) => d.id);
  const createdIds: string[] = [];
  const byYear: Record<string, string[]> = {};

  // ---- 2025: 3 semanas por mes ----
  for (let month = 0; month < 12; month++) {
    const mondays = allMondaysOfMonth(2025, month);
    if (mondays.length === 0) continue;

    const picks: Date[] = [];
    const first = mondays[0];
    const third = mondays[2] ?? mondays[1] ?? mondays[0];
    const last = mondays[mondays.length - 1];
    const fourth = mondays[3];

    picks.push(first);
    if (!picks.some((d) => d.getUTCDate() === third.getUTCDate())) picks.push(third);
    const lastPick = picks.some((d) => d.getUTCDate() === last.getUTCDate()) && fourth ? fourth : last;
    if (!picks.some((d) => d.getUTCDate() === lastPick.getUTCDate())) picks.push(lastPick);

    while (picks.length < 3 && mondays.length >= 2) {
      const alt = addDaysUTC(picks[picks.length - 1], -7);
      if (alt.getUTCMonth() === month) picks.push(alt);
      else break;
    }

    for (const d of picks.slice(0, 3)) {
      const start = toYMD(d);
      const { id } = await createWeeklyPlan(start, dinerIds);
      createdIds.push(id);
      (byYear['2025'] ??= []).push(start);
      await insertDummyMealsForWeek(id, dinerIds, mealTypes);
    }
  }

  // ---- 2024: 3 semanas (feb, jun, oct) -> 2º lunes
  for (const m of [1, 5, 9]) {
    const mondays = allMondaysOfMonth(2024, m);
    const choice = mondays[1] ?? mondays[0] ?? null;
    if (!choice) continue;
    const start = toYMD(choice);
    const { id } = await createWeeklyPlan(start, dinerIds);
    createdIds.push(id);
    (byYear['2024'] ??= []).push(start);
    await insertDummyMealsForWeek(id, dinerIds, mealTypes);
  }

  // ---- 2023: 2 semanas (mar, nov) -> 3º lunes si existe
  for (const m of [2, 10]) {
    const mondays = allMondaysOfMonth(2023, m);
    const choice = mondays[2] ?? mondays[1] ?? mondays[0] ?? null;
    if (!choice) continue;
    const start = toYMD(choice);
    const { id } = await createWeeklyPlan(start, dinerIds);
    createdIds.push(id);
    (byYear['2023'] ??= []).push(start);
    await insertDummyMealsForWeek(id, dinerIds, mealTypes);
  }

  for (const y of Object.keys(byYear)) {
    byYear[y] = byYear[y].sort((a, b) => b.localeCompare(a));
  }

  return { created: createdIds, byYear };
}

/**
 * Borra SOLO los meals actuales de toda la base (útil para resembrar meals).
 */
export async function wipeOnlyMeals(): Promise<number> {
  const mealsSnap = await getDocs(collection(db, MEALS));
  if (mealsSnap.empty) return 0;
  let acc = { batch: writeBatch(db), ops: 0 };
  let count = 0;

  mealsSnap.forEach((m) => {
    acc.batch.delete(doc(db, MEALS, m.id));
    acc.ops++; count++;
  });

  await flushBatch(acc);
  return count;
}

/**
 * Borrado total en cascada:
 * 1) Elimina todos los meals (por cada dailyPlan).
 * 2) Elimina todos los dailyPlans.
 * 3) Elimina todos los weeklyPlans.
 * Devuelve un pequeño resumen.
 */
export async function nukeAllWeeklyPlansCascade(): Promise<{ meals: number; dailyPlans: number; weeklyPlans: number; }> {
  // 1) DailyPlans -> Meals
  const dpSnap = await getDocs(collection(db, DAILY_PLANS));
  let mealsDeleted = 0;
  let acc = { batch: writeBatch(db), ops: 0 };

  for (const dpDoc of dpSnap.docs) {
    const dpId = dpDoc.id;
    const mealsQ = query(collection(db, MEALS), where('dailyPlanId', '==', dpId));
    const mealsSnap = await getDocs(mealsQ);
    for (const mealDoc of mealsSnap.docs) {
      acc.batch.delete(doc(db, MEALS, mealDoc.id));
      acc.ops++; mealsDeleted++;
      await commitBatchWithLimit(acc);
    }
  }
  await flushBatch(acc);

  // 2) DailyPlans
  const dpSnap2 = await getDocs(collection(db, DAILY_PLANS));
  let dpsDeleted = 0;
  acc = { batch: writeBatch(db), ops: 0 };
  for (const dp of dpSnap2.docs) {
    acc.batch.delete(doc(db, DAILY_PLANS, dp.id));
    acc.ops++; dpsDeleted++;
    await commitBatchWithLimit(acc);
  }
  await flushBatch(acc);

  // 3) WeeklyPlans
  const wpSnap = await getDocs(collection(db, WEEKLY_PLANS));
  let wpsDeleted = 0;
  acc = { batch: writeBatch(db), ops: 0 };
  for (const wp of wpSnap.docs) {
    acc.batch.delete(doc(db, WEEKLY_PLANS, wp.id));
    acc.ops++; wpsDeleted++;
    await commitBatchWithLimit(acc);
  }
  await flushBatch(acc);

  return { meals: mealsDeleted, dailyPlans: dpsDeleted, weeklyPlans: wpsDeleted };
}
