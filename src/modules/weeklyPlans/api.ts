// src/modules/weeklyPlans/api.ts
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { WeeklyPlan, DailyPlan, Meal, DailyPlanView, WeeklyPlanView } from './types';

import type { Food } from '$modules/foods/types';
import { getFoodsByIds } from '$modules/foods/api';
import type { Recipe } from '$modules/recipes/types';
import { getRecipesByIds } from '$modules/recipes/api';
import { getAllDiners } from '$modules/diners/api';
import type { Diner } from '$modules/diners/types';

const weeklyPlansCollection = collection(db, 'weeklyPlans');
const dailyPlansCollection = collection(db, 'dailyPlans');
const mealsCollection = collection(db, 'meals');

/* =========================
   Helpers de fechas
========================= */

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getUTCDay(); // 0 (domingo) .. 6 (sábado)
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // lunes
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date {
    const [y, m, d] = dateString.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCHours(0, 0, 0, 0);
    return dt;
}

const nowTs = () => Timestamp.fromDate(new Date());
const asTimestamp = (v: unknown): Timestamp => (v instanceof Timestamp ? v : nowTs());

/* =========================
   Carga WeeklyPlanView
========================= */

export async function getWeeklyPlanView(startDateString: string): Promise<WeeklyPlanView> {
    const startDate = parseDate(startDateString);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);
    const endDateString = formatDate(endDate);

    // Buscar plan semanal materializado
    const weeklyPlanQuery = query(weeklyPlansCollection, where('startDate', '==', startDateString));
    const weeklyPlanSnapshot = await getDocs(weeklyPlanQuery);

    let weeklyPlan: WeeklyPlan | null = null;
    let dailyPlans: DailyPlan[] = [];
    let meals: Meal[] = [];
    let isVirtual = true;

    // Para la vista exponemos solo los IDs incluidos (included: true)
    let includedDinerIds: string[] = [];

    if (!weeklyPlanSnapshot.empty) {
        // Existe WeeklyPlan
        weeklyPlan = { id: weeklyPlanSnapshot.docs[0].id, ...weeklyPlanSnapshot.docs[0].data() } as WeeklyPlan;
        isVirtual = false;

        // Soporte retro-compatibilidad: si 'diners' viniera como string[] en DB, lo convertimos a objetos incluídos
        let dinersField: any = (weeklyPlan as any).diners ?? [];
        if (Array.isArray(dinersField) && typeof dinersField[0] === 'string') {
            // Migración en caliente a objetos { dinerId, included: true }
            dinersField = (dinersField as string[]).map((id) => ({ dinerId: id, included: true }));
        }
        // Guardamos de nuevo en memoria para tipado
        (weeklyPlan as any).diners = dinersField;

        includedDinerIds = (dinersField as Array<{ dinerId: string; included: boolean }>)
            .filter((x) => x.included)
            .map((x) => x.dinerId);

        // DailyPlans y Meals
        const dailyPlansQuery = query(dailyPlansCollection, where('weeklyPlanId', '==', weeklyPlan.id));
        const dailyPlansSnapshot = await getDocs(dailyPlansQuery);
        dailyPlans = dailyPlansSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as DailyPlan[];

        if (dailyPlans.length > 0) {
            const dailyPlanIds = dailyPlans.map((dp) => dp.id);
            // 7 ids -> seguro < 10 (límite IN)
            const mealsQueryRef = query(mealsCollection, where('dailyPlanId', 'in', dailyPlanIds));
            const mealsSnapshot = await getDocs(mealsQueryRef);
            meals = mealsSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Meal[];
        }
    } else {
        // Vista virtual (no persistido): por defecto todos los comensales incluidos
        const allDiners = await getAllDiners();
        includedDinerIds = allDiners.map((d) => d.id);

        // DailyPlans virtuales
        const current = new Date(startDate);
        for (let i = 0; i < 7; i++) {
            const dateString = formatDate(current);
            const jsDay = current.getUTCDay(); // 0..6 (domingo..sábado)
            const dayOfWeek = jsDay === 0 ? 7 : jsDay; // 1=lunes .. 7=domingo

            dailyPlans.push({
                id: `virtual-dailyplan-${dateString}`,
                weeklyPlanId: 'virtual',
                date: dateString,
                dayOfWeek
            } as DailyPlan);

            current.setUTCDate(current.getUTCDate() + 1);
        }
    }

    // Armar vista
    const dailyPlansView: DailyPlanView[] = dailyPlans.map((dp) => ({
        ...dp,
        meals: meals.filter((m) => m.dailyPlanId === dp.id)
    }));

    const weeklyPlanView: WeeklyPlanView = {
        id: weeklyPlan?.id || 'virtual-weeklyplan',
        startDate: startDateString,
        endDate: endDateString,
        // Exponemos solo los IDs incluidos (para la UI actual)
        diners: includedDinerIds,
        createdAt: asTimestamp(weeklyPlan?.createdAt),
        updatedAt: asTimestamp(weeklyPlan?.updatedAt),
        dailyPlans: dailyPlansView,
        isVirtual
    };

    // Denormalización ligera para Meals (foods/recipes)
    const foodIds = meals.map((m) => m.foodId).filter(Boolean) as string[];
    const recipeIds = meals.map((m) => m.recipeId).filter(Boolean) as string[];

    const [foods, recipes] = await Promise.all([
        foodIds.length > 0 ? getFoodsByIds(foodIds) : Promise.resolve([] as Food[]),
        recipeIds.length > 0 ? getRecipesByIds(recipeIds) : Promise.resolve([] as Recipe[])
    ]);

    weeklyPlanView.dailyPlans.forEach((dp) => {
        dp.meals.forEach((meal) => {
            if (!meal.name || meal.calories == null) {
                const f = foods.find((x) => x.id === meal.foodId);
                const r = recipes.find((x) => x.id === meal.recipeId);
                if (f) {
                    meal.name = f.name;
                    meal.calories = f.calories;
                    meal.proteins = f.proteins;
                    meal.carbs = f.carbs;
                    meal.fat = f.fat;
                } else if (r) {
                    // TODO: calcular macros reales de la receta
                    meal.name = r.name;
                }
            }
        });
    });

    return weeklyPlanView;
}

/* =========================
   Materializar plan semanal
========================= */

export async function materializeWeeklyPlan(
    startDateString: string,
    initialDinerIds: string[]
): Promise<{ weeklyPlanId: string; dailyPlanIds: { [date: string]: string } }> {
    // Si ya existe, devolver IDs
    const existingPlanQuery = query(weeklyPlansCollection, where('startDate', '==', startDateString));
    const existingPlanSnapshot = await getDocs(existingPlanQuery);

    if (!existingPlanSnapshot.empty) {
        const existingPlan = { id: existingPlanSnapshot.docs[0].id, ...existingPlanSnapshot.docs[0].data() } as WeeklyPlan;
        const dpQuery = query(dailyPlansCollection, where('weeklyPlanId', '==', existingPlan.id));
        const dpSnapshot = await getDocs(dpQuery);
        const dailyPlanIds: { [date: string]: string } = {};
        dpSnapshot.docs.forEach((docSnap) => {
            const dp = docSnap.data() as DailyPlan;
            dailyPlanIds[dp.date] = docSnap.id;
        });
        return { weeklyPlanId: existingPlan.id, dailyPlanIds };
    }

    // Definir fechas
    const startDate = parseDate(startDateString);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);
    const endDateString = formatDate(endDate);

    // Diners a guardar: objetos { dinerId, included: true }
    let dinersToSave: Array<{ dinerId: string; included: boolean }>;
    if (initialDinerIds?.length) {
        dinersToSave = initialDinerIds.map((id) => ({ dinerId: id, included: true }));
    } else {
        const all = await getAllDiners();
        dinersToSave = all.map((d) => ({ dinerId: d.id, included: true }));
    }

    // Crear WeeklyPlan
    const weeklyPlanRef = await addDoc(weeklyPlansCollection, {
        startDate: startDateString,
        endDate: endDateString,
        diners: dinersToSave,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    const weeklyPlanId = weeklyPlanRef.id;

    // Crear 7 DailyPlans
    const dailyPlanIds: { [date: string]: string } = {};
    const current = new Date(startDate);

    for (let i = 0; i < 7; i++) {
        const dateString = formatDate(current);
        const jsDay = current.getUTCDay();
        const dayOfWeek = jsDay === 0 ? 7 : jsDay; // 1..7

        const dailyPlanRef = await addDoc(dailyPlansCollection, {
            weeklyPlanId,
            date: dateString,
            dayOfWeek,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        dailyPlanIds[dateString] = dailyPlanRef.id;
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return { weeklyPlanId, dailyPlanIds };
}

/* =========================
   CRUD Meals (simplificado)
========================= */

export async function createMeal(
    mealData: Omit<
        Meal,
        'id' | 'createdAt' | 'updatedAt' | 'name' | 'calories' | 'proteins' | 'carbs' | 'fat'
    >,
    startDateString: string
): Promise<string> {
    // 1) Si la semana es virtual, materializar primero
    const weeklyPlanQuery = query(weeklyPlansCollection, where('startDate', '==', startDateString));
    const weeklyPlanSnapshot = await getDocs(weeklyPlanQuery);

    let weeklyPlanId: string;
    let dailyPlanIdToUse = mealData.dailyPlanId;
    let dailyPlanIdsMapping: { [date: string]: string } = {};

    if (weeklyPlanSnapshot.empty) {
        const currentWeeklyPlanView = await getWeeklyPlanView(startDateString);
        // Usamos los comensales de la vista (IDs incluidos) o todos si no hay
        const allDiners = await getAllDiners();
        const initialIds = currentWeeklyPlanView.diners.length
            ? currentWeeklyPlanView.diners
            : allDiners.map((d) => d.id);

        const materialization = await materializeWeeklyPlan(startDateString, initialIds);
        weeklyPlanId = materialization.weeklyPlanId;
        dailyPlanIdsMapping = materialization.dailyPlanIds;

        const virtualDate = currentWeeklyPlanView.dailyPlans.find((dp) => dp.id === mealData.dailyPlanId)?.date;
        if (!virtualDate) throw new Error('Could not find virtual daily plan date for materialization');
        dailyPlanIdToUse = dailyPlanIdsMapping[virtualDate];
    } else {
        weeklyPlanId = weeklyPlanSnapshot.docs[0].id;

        // Si llega un id virtual, lo mapeamos mediante la fecha contenida en él
        if (mealData.dailyPlanId?.startsWith('virtual-dailyplan-')) {
            const dateStr = mealData.dailyPlanId.split('virtual-dailyplan-')[1];
            const dpQueryReal = query(
                dailyPlansCollection,
                where('weeklyPlanId', '==', weeklyPlanId),
                where('date', '==', dateStr)
            );
            const dpSnap = await getDocs(dpQueryReal);
            if (!dpSnap.empty) dailyPlanIdToUse = dpSnap.docs[0].id;
        }
    }

    // 2) Denormalizar food/recipe
    let denorm: { name: string; calories: number; proteins: number; carbs: number; fat: number };

    if (mealData.foodId) {
        const foods = await getFoodsByIds([mealData.foodId]);
        if (!foods.length) throw new Error('Food not found');
        const f = foods[0];
        denorm = {
            name: f.name,
            calories: f.calories,
            proteins: f.proteins,
            carbs: f.carbs,
            fat: f.fat
        };
    } else if (mealData.recipeId) {
        const recipes = await getRecipesByIds([mealData.recipeId]);
        if (!recipes.length) throw new Error('Recipe not found');
        const r = recipes[0];
        // TODO: cálculo real de macros receta
        denorm = {
            name: r.name,
            calories: 0,
            proteins: 0,
            carbs: 0,
            fat: 0
        };
    } else {
        throw new Error('Meal must be associated with a Food or a Recipe');
    }

    // 3) Crear Meal
    const docRef = await addDoc(mealsCollection, {
        ...mealData,
        dailyPlanId: dailyPlanIdToUse,
        ...denorm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
}

export async function updateMeal(
    id: string,
    mealData: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt' | 'name' | 'calories' | 'proteins' | 'carbs' | 'fat'>>,
    startDateString: string
): Promise<void> {
    // 1) Materializar si es virtual
    const weeklyPlanQuery = query(weeklyPlansCollection, where('startDate', '==', startDateString));
    const weeklyPlanSnapshot = await getDocs(weeklyPlanQuery);
    if (weeklyPlanSnapshot.empty) {
        const currentWeeklyPlanView = await getWeeklyPlanView(startDateString);
        const all = await getAllDiners();
        const initialIds = currentWeeklyPlanView.diners.length
            ? currentWeeklyPlanView.diners
            : all.map((d) => d.id);
        await materializeWeeklyPlan(startDateString, initialIds);
    }

    // 2) Denormalizar si cambia foodId/recipeId
    let denorm:
        | { name: string; calories: number; proteins: number; carbs: number; fat: number }
        | null = null;

    if (mealData.foodId) {
        const foods = await getFoodsByIds([mealData.foodId]);
        if (!foods.length) throw new Error('Food not found for update');
        const f = foods[0];
        denorm = {
            name: f.name,
            calories: f.calories,
            proteins: f.proteins,
            carbs: f.carbs,
            fat: f.fat
        };
    } else if (mealData.recipeId) {
        const recipes = await getRecipesByIds([mealData.recipeId]);
        if (!recipes.length) throw new Error('Could not find Recipe for update');
        const r = recipes[0];
        // TODO: cálculo real de macros receta
        denorm = {
            name: r.name,
            calories: 0,
            proteins: 0,
            carbs: 0,
            fat: 0
        };
    }

    // 3) Actualizar
    const mealRef = doc(db, 'meals', id);
    const updateData: Partial<Meal> = {
        ...mealData,
        updatedAt: serverTimestamp()
    };
    if (denorm) Object.assign(updateData, denorm);

    await updateDoc(mealRef, updateData);
}

export async function deleteMeal(id: string): Promise<void> {
    const mealRef = doc(db, 'meals', id);
    await deleteDoc(mealRef);
    // Nota: no eliminamos contenedores vacíos automáticamente.
}

/* =========================
   Diners en WeeklyPlan
========================= */

// Guarda en DB: [{ dinerId, included }]
export async function updateWeeklyPlanDiners(
    weeklyPlanId: string | null,
    diners: Array<{ dinerId: string; included: boolean }>,
    startDateString: string
): Promise<void> {
    // Si es virtual, materializamos con los dinerId incluidos
    const weeklyPlanQuery = query(weeklyPlansCollection, where('startDate', '==', startDateString));
    const weeklyPlanSnapshot = await getDocs(weeklyPlanQuery);

    let weeklyPlanIdToUse = weeklyPlanId ?? undefined;

    if (weeklyPlanSnapshot.empty) {
        const includedIds = diners.filter((x) => x.included).map((x) => x.dinerId);
        const mat = await materializeWeeklyPlan(startDateString, includedIds);
        weeklyPlanIdToUse = mat.weeklyPlanId;
    } else {
        weeklyPlanIdToUse = weeklyPlanSnapshot.docs[0].id;
    }

    if (!weeklyPlanIdToUse) throw new Error('weeklyPlanId could not be determined');

    const planRef = doc(db, 'weeklyPlans', weeklyPlanIdToUse);
    await updateDoc(planRef, {
        diners,
        updatedAt: serverTimestamp()
    });
}

/* =========================
   Listado de semanas
========================= */

export async function listMaterializedWeeks(year?: number): Promise<WeeklyPlan[]> {
    let qRef = query(weeklyPlansCollection);

    if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        qRef = query(weeklyPlansCollection, where('startDate', '>=', startDate), where('startDate', '<=', endDate));
    }

    const snapshot = await getDocs(qRef);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as WeeklyPlan[];
}

/* =========================
   TODOs pendientes
========================= */
// TODO: Cálculo de macros de receta (crear/actualizar/cargar).
// TODO: Duplicar semana a nueva fecha (clonado completo).
// TODO: (Opcional) Eliminar contenedores vacíos si no hay meals.