import type { PageLoad } from './$types';
import { getWeeklyPlanView, listMaterializedWeeks } from '$modules/weeklyPlans/api';
import type { WeeklyPlanView, WeeklyPlan } from '$modules/weeklyPlans/types';
import { getAllDiners } from '$modules/diners/api';
import type { Diner } from '$modules/diners/types';
import { getAllMealTypes } from '$modules/mealTypes/api';
import type { MealType } from '$modules/mealTypes/types';

export const load: PageLoad = async ({ url }) => {
  // Lee ?start=YYYY-MM-DD (fallback a ?startDate=… por compatibilidad)
  const param = url.searchParams.get('start') || url.searchParams.get('startDate');
  const startDateString = param ?? getMondayUTC();

  // Vista de la semana (virtual o materializada)
  const weeklyPlanView: WeeklyPlanView = await getWeeklyPlanView(startDateString);

  // Semanas materializadas -> array de fechas (strings) para el <select>
  const materializedWeeksDocs: WeeklyPlan[] = await listMaterializedWeeks();
  const materializedWeeks: string[] = materializedWeeksDocs
    .map((w) => (typeof w.startDate === 'string' ? w.startDate : formatDateFromAny(w.startDate)))
    .filter(Boolean);

  // Catálogos
  const allDiners: Diner[] = await getAllDiners();
  const mealTypes: MealType[] = await getAllMealTypes();

  // Datos útiles para la UI
  const weeklyPlanId = weeklyPlanView.isVirtual ? null : weeklyPlanView.id;
  const participantIds: string[] = weeklyPlanView.diners; // IDs incluidos

  return {
    weeklyPlanView,
    weeklyPlanId,
    participantIds,
    materializedWeeks,
    allDiners,
    mealTypes,
    startDateString
  };
};

// === Helpers (UTC) ===
function getMondayUTC(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=domingo..6=sábado
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // lunes
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  return formatDateUTC(monday);
}

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

// Soporte si en DB hubiera Date/Timestamp por algún motivo
function formatDateFromAny(value: any): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return formatDateUTC(value);
  if (value && typeof value.seconds === 'number') {
    const d = new Date(value.seconds * 1000);
    return formatDateUTC(d);
  }
  return '';
}
