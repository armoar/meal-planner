import type { PageLoad } from './$types';
import { listWeeklyPlans } from '$modules/weeklyPlans/api';
import type { WeeklyPlan } from '$modules/weeklyPlans/types';
import { getAllDiners } from '$modules/diners/api';

type Grouped = Record<string, Record<string, WeeklyPlan[]>>; // {YYYY:{MM:[plans]}}

export const ssr = false;

export const load: PageLoad = async () => {
  const [plans, diners] = await Promise.all([listWeeklyPlans(), getAllDiners()]);

  diners.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

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

  // semanas deshabilitadas: todos los lunes con plan existente
  const disabledWeeks = Array.from(
    new Set(
      plans.map((p) =>
        typeof p.startDate === 'string'
          ? p.startDate
          : new Date((p as any).startDate.seconds * 1000).toISOString().slice(0, 10)
      )
    )
  );

  return { plans, diners, grouped, yearsDesc, monthsByYear, disabledWeeks };
};
