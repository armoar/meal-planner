import type { PageLoad } from './$types';
import { listWeeklyPlans } from '$modules/weeklyPlans/api';
import type { WeeklyPlan } from '$modules/weeklyPlans/types';

type Grouped = Record<string, Record<string, WeeklyPlan[]>>; // {YYYY:{MM:[plans]}}

export const load: PageLoad = async () => {
  const plans = await listWeeklyPlans(); // ya vienen startDate desc

  const grouped: Grouped = plans.reduce((acc, p) => {
    const [y, m] = p.startDate.split('-'); // YYYY-MM-DD
    (acc[y] ??= {});
    (acc[y][m] ??= []).push(p);
    return acc;
  }, {} as Grouped);

  const yearsDesc = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const monthsByYear: Record<string, string[]> = {};
  for (const y of yearsDesc) {
    monthsByYear[y] = Object.keys(grouped[y]).sort((a, b) => b.localeCompare(a)); // "01".."12" desc
  }

  return { plans, grouped, yearsDesc, monthsByYear };
};
