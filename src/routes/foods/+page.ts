import { initDefaultFoods, getAllFoods } from '$modules/foods/api';
import type { Food } from '$modules/foods/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	await initDefaultFoods();
	const foods: Food[] = await getAllFoods();

	return {
		foods
	};
};
