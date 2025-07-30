import { getDocs } from 'firebase/firestore';
import { getAllUnits, initDefaultUnits } from '$modules/units/api';
import type { Unit } from '$modules/units/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	await initDefaultUnits();
	const units = await getAllUnits();

	// Orden alfabético por nombre (ya con tildes y mayúsculas)
  units.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  return { units };

}
