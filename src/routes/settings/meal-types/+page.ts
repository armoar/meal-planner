import { initDefaultMealTypes, getAllMealTypes } from '$modules/mealTypes/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	await initDefaultMealTypes();
	const mealTypes = await getAllMealTypes();

	return {
		mealTypes
	};
};
