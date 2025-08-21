import type { PageLoad } from './$types';
import { getWeeklyPlan, listWeeklyPlans } from '$modules/weeklyPlans/api';
import type { WeeklyPlanView } from '$modules/weeklyPlans/types';
import { getAllDiners } from '$modules/diners/api';
import type { Diner } from '$modules/diners/types';
import { getAllMealTypes } from '$modules/mealTypes/api';
import type { MealType } from '$modules/mealTypes/types';

export const load: PageLoad = async ({ url }) => {
  const id = url.searchParams.get('id');
  const startParam = url.searchParams.get('start') || url.searchParams.get('startDate');
  const idOrStart = id ?? startParam ?? getMondayUTC();

  const weeklyPlanView: WeeklyPlanView = await getWeeklyPlan(idOrStart);

  const plans = await listWeeklyPlans();
  const materializedWeeks: string[] = plans.map((p) => p.startDate).filter(Boolean);

  const allDiners: Diner[] = await getAllDiners();
  const mealTypes: MealType[] = await getAllMealTypes();

  const weeklyPlanId = weeklyPlanView.id;
  const participantIds: string[] = weeklyPlanView.diners;

  return {
    weeklyPlanView,
    weeklyPlanId,
    participantIds,
    materializedWeeks,
    allDiners,
    mealTypes,
    startDateString: weeklyPlanView.startDate
  };
};

function getMondayUTC(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
  return formatDateUTC(monday);
}

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const da = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}
