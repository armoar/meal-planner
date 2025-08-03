import { initDefaultDiners, getAllDiners } from '$modules/diners/api';
import type { Diner } from '$modules/diners/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	await initDefaultDiners();
	const diners = await getAllDiners();

	// Orden alfabético por nombre (tildes y mayúsculas incluidas)
	diners.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

	return {
		diners
	};
};
