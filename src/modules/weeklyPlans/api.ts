// src/modules/weeklyPlans/api.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
    where,
    writeBatch,
    limit,
    updateDoc
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type {
    DailyPlanView,
    WeeklyPlan,
    WeeklyPlanDiner,
    WeeklyPlanView
  } from './types';
  import type { DailyPlan } from '$modules/dailyPlans/types';
  import type { Meal } from '$modules/meals/types';
import type { Diner } from '$modules/diners/types';
  
  // ==== Colecciones (raíz) ====
  const WEEKLY_PLANS = 'weeklyPlans';
  const DAILY_PLANS = 'dailyPlans';
  const MEALS = 'meals';
  // Colección de llaves de unicidad por startDate
  const WEEKLY_PLAN_KEYS = 'weeklyPlanKeys';
  
  // ==== Helpers de fecha (locales, sin dependencias externas) ====
  
  /** YYYY-MM-DD (sin TZ) → Date a medianoche local */
  function parseYMD(ymd: string): Date {
    const [y, m, d] = ymd.split('-').map(Number);
    // Mes en JS es [0..11]
    return new Date(y, (m - 1), d);
  }
  
  function addDays(ymd: string, days: number): string {
    const dt = parseYMD(ymd);
    dt.setDate(dt.getDate() + days);
    const y = dt.getFullYear();
    const m = `${dt.getMonth() + 1}`.padStart(2, '0');
    const d = `${dt.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  /** 1 = lunes ... 7 = domingo */
  function dayOfWeek1to7(ymd: string): number {
    const dt = parseYMD(ymd);
    const js = dt.getDay(); // 0..6 (0=domingo)
    return js === 0 ? 7 : js; // 1..7, lunes=1
  }
  
  function isMonday(ymd: string): boolean {
    return dayOfWeek1to7(ymd) === 1;
  }
  
  /** Para la vista, garantizamos Timestamp "duro" */
  function asTimestamp(v: unknown): Timestamp {
    return v instanceof Timestamp ? v : Timestamp.fromDate(new Date());
  }
  
  /** Compat lectura: si vienen `diners: string[]`, convertirlos a objetos */
  function normalizePersistedDiners(dinersField: unknown): WeeklyPlanDiner[] {
    if (Array.isArray(dinersField) && dinersField.length > 0) {
      if (typeof dinersField[0] === 'string') {
        return (dinersField as string[]).map((id) => ({ dinerId: id, included: true }));
      }
      return dinersField as WeeklyPlanDiner[];
    }
    return [];
  }
  
  /** Deriva la lista de IDs incluidos para la vista */
  function dinersIncludedIds(diners: WeeklyPlanDiner[]): string[] {
    return diners.filter((d) => d.included).map((d) => d.dinerId);
  }
  
  // ==== API pública ==== //
  
  /**
   * Crea un weeklyPlan real (sin meals) con sus 7 dailyPlans (lunes→domingo).
   * Unicidad por startDate garantizada con un "documento llave" en WEEKLY_PLAN_KEYS.
   */
  export async function createWeeklyPlan(
    startDate: string,
    dinerIds: string[],
    allDiners?: Diner[]            // <— NUEVO parámetro opcional
  ): Promise<{ id: string }> {
    if (!isMonday(startDate)) {
      throw new Error('La fecha de inicio debe ser lunes.');
    }
  
    const weeklyPlansCol = collection(db, WEEKLY_PLANS);
    const dailyPlansCol = collection(db, DAILY_PLANS);
    const keyRef = doc(db, WEEKLY_PLAN_KEYS, startDate); // llave única por startDate
  
    const endDate = addDays(startDate, 6);
  
    // ======= SOLO ESTO CAMBIA =======
    // Si recibimos todos los comensales: guardamos TODOS con included según dinerIds.
    // Si no, mantenemos el comportamiento anterior (solo los seleccionados con included:true).
    let dinersPersist: WeeklyPlanDiner[];
    if (allDiners && allDiners.length > 0) {
      const selected = new Set(dinerIds);
      dinersPersist = allDiners.map((d) => ({
        dinerId: d.id,
        included: selected.has(d.id)
      }));
    } else {
      dinersPersist = dinerIds.map((dinerId) => ({ dinerId, included: true }));
    }
    // ======= FIN CAMBIO =======
  
    const newId = await runTransaction(db, async (tx) => {
      // 1) Comprobar/crear llave única
      const keySnap = await tx.get(keyRef);
      if (keySnap.exists()) {
        throw new Error('Ya existe un plan para ese lunes.');
      }
  
      // 2) Crear weeklyPlan (id aleatorio)
      const weeklyPlanRef = doc(weeklyPlansCol);
      tx.set(weeklyPlanRef, {
        startDate,
        endDate,
        diners: dinersPersist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      // 3) Crear 7 dailyPlans
      for (let i = 0; i < 7; i++) {
        const dateYMD = addDays(startDate, i);
        const dow = dayOfWeek1to7(dateYMD);
        const dpRef = doc(dailyPlansCol);
        tx.set(dpRef, {
          weeklyPlanId: weeklyPlanRef.id,
          date: dateYMD,
          dayOfWeek: dow,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
  
      // 4) Persistir la llave → asegura unicidad futura
      tx.set(keyRef, {
        weeklyPlanId: weeklyPlanRef.id,
        createdAt: serverTimestamp()
      });
  
      return weeklyPlanRef.id;
    });
  
    return { id: newId };
  }
  
  /**
   * Obtiene un WeeklyPlanView por id o por startDate.
   */
  export async function getWeeklyPlan(idOrStart: string): Promise<WeeklyPlanView> {
    const weeklyPlansCol = collection(db, WEEKLY_PLANS);
  
    // 1) Intento: tratar como id (docId)
    const maybeDocRef = doc(weeklyPlansCol, idOrStart);
    const maybeDocSnap = await getDoc(maybeDocRef);
  
    let weeklyPlanId: string | null = null;
    let weeklyPlanData: any | null = null;
  
    if (maybeDocSnap.exists()) {
      weeklyPlanId = maybeDocSnap.id;
      weeklyPlanData = maybeDocSnap.data();
    } else {
      // 2) Intento: tratar como startDate
      const q = query(weeklyPlansCol, where('startDate', '==', idOrStart), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error('No existe un plan con ese id o startDate.');
      }
      const docSnap = snap.docs[0];
      weeklyPlanId = docSnap.id;
      weeklyPlanData = docSnap.data();
    }
  
    // Compat diners
    const dinersNorm = normalizePersistedDiners(weeklyPlanData.diners);
  
    const baseWeeklyPlan: WeeklyPlan = {
      id: weeklyPlanId!,
      startDate: weeklyPlanData.startDate,
      endDate: weeklyPlanData.endDate,
      diners: dinersNorm,
      createdAt: weeklyPlanData.createdAt,
      updatedAt: weeklyPlanData.updatedAt
    };
  
    // Cargar dailyPlans de este weeklyPlan
    const dailyPlansQ = query(collection(db, DAILY_PLANS), where('weeklyPlanId', '==', weeklyPlanId));
    const dailyPlansSnap = await getDocs(dailyPlansQ);
  
    // Construir vistas de dailyPlans con meals reales
    const dailyPlanViews: DailyPlanView[] = [];
    for (const dpDoc of dailyPlansSnap.docs) {
      const dpData = dpDoc.data() as Omit<DailyPlan, 'id'>;
      const dailyPlan: DailyPlan = {
        id: dpDoc.id,
        ...dpData
      };
  
      // Cargar meals de este dailyPlan
      const mealsQ = query(collection(db, MEALS), where('dailyPlanId', '==', dpDoc.id));
      const mealsSnap = await getDocs(mealsQ);
      const meals: Meal[] = mealsSnap.docs.map((m) => ({ id: m.id, ...(m.data() as Omit<Meal, 'id'>) }));
  
      dailyPlanViews.push({ ...dailyPlan, meals });
    }
  
    // Para la vista, `diners` pasa a IDs incluidos
    const view: WeeklyPlanView = {
      id: baseWeeklyPlan.id,
      startDate: baseWeeklyPlan.startDate,
      endDate: baseWeeklyPlan.endDate,
      diners: dinersIncludedIds(baseWeeklyPlan.diners),
      createdAt: asTimestamp(baseWeeklyPlan.createdAt),
      updatedAt: asTimestamp(baseWeeklyPlan.updatedAt),
      dailyPlans: dailyPlanViews
    };
  
    return view;
  }
  
  /**
   * Lista todos los weeklyPlans ordenados por startDate desc.
   * (La UI los agrupa por año/mes)
   */
  export async function listWeeklyPlans(): Promise<WeeklyPlan[]> {
    const q = query(collection(db, WEEKLY_PLANS), orderBy('startDate', 'desc'));
    const snap = await getDocs(q);
  
    const plans: WeeklyPlan[] = [];
    for (const d of snap.docs) {
      const data = d.data() as any;
  
      // Compat diners
      const dinersNorm = normalizePersistedDiners(data.diners);
  
      plans.push({
        id: d.id,
        startDate: data.startDate,
        endDate: data.endDate,
        diners: dinersNorm,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    }
    return plans;
  }
  
  /**
   * Borra un weeklyPlan. Si cascade:
   * - Obtiene dailyPlans
   * - Para cada dailyPlan, borra sus meals
   * - Borra dailyPlans
   * - Finalmente borra weeklyPlan
   * Además borra la llave de unicidad en WEEKLY_PLAN_KEYS si existe.
   */
  export async function deleteWeeklyPlan(id: string, cascade = true): Promise<void> {
    const weeklyPlanRef = doc(db, WEEKLY_PLANS, id);
  
    // Borrar llave de unicidad si la encontramos (buscamos por startDate)
    const wpSnap = await getDoc(weeklyPlanRef);
    const startDate: string | undefined = wpSnap.exists() ? wpSnap.data()?.startDate : undefined;
    const keyRef = startDate ? doc(db, WEEKLY_PLAN_KEYS, startDate) : null;
  
    if (!cascade) {
      await deleteDoc(weeklyPlanRef);
      if (keyRef) await deleteDoc(keyRef);
      return;
    }
  
    // 1) dailyPlans del weeklyPlan
    const dailyPlansQ = query(collection(db, DAILY_PLANS), where('weeklyPlanId', '==', id));
    const dailyPlansSnap = await getDocs(dailyPlansQ);
  
    // 2) Para cada dailyPlan, borrar meals
    const mealIdsToDelete: string[] = [];
    for (const dp of dailyPlansSnap.docs) {
      const mealsQ = query(collection(db, MEALS), where('dailyPlanId', '==', dp.id));
      const mealsSnap = await getDocs(mealsQ);
      for (const m of mealsSnap.docs) {
        mealIdsToDelete.push(m.id);
      }
    }
  
    // Borrado en lotes (meals)
    for (let i = 0; i < mealIdsToDelete.length; i += 500) {
      const chunk = mealIdsToDelete.slice(i, i + 500);
      const batch = writeBatch(db);
      for (const idMeal of chunk) {
        batch.delete(doc(db, MEALS, idMeal));
      }
      await batch.commit();
    }
  
    // Borrado en lotes (dailyPlans)
    const dailyPlanIds = dailyPlansSnap.docs.map((d) => d.id);
    for (let i = 0; i < dailyPlanIds.length; i += 500) {
      const chunk = dailyPlanIds.slice(i, i + 500);
      const batch = writeBatch(db);
      for (const idDp of chunk) {
        batch.delete(doc(db, DAILY_PLANS, idDp));
      }
      await batch.commit();
    }
  
    // 3) Borra el weeklyPlan y su llave (si la hay)
    await deleteDoc(weeklyPlanRef);
    if (keyRef) await deleteDoc(keyRef);
  }
  
  // ===== NOTA: createMeal/updateMeal/deleteMeal =====
  // Mantén las funciones actuales de meals tal cual (en su propio módulo).
  // Desde ahora NO deben hacer materialización: el dailyPlanId siempre existe
  // porque se crea con createWeeklyPlan().
  
  export async function updateWeeklyPlanDiners(
    weeklyPlanId: string,
    diners: { dinerId: string; included: boolean }[]
  ): Promise<void> {
    const ref = doc(db, WEEKLY_PLANS, weeklyPlanId);
    await updateDoc(ref, { diners, updatedAt: serverTimestamp() });
  }
  