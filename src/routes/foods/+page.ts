import { initDefaultFoods, getAllFoods } from '$modules/foods/api';
import type { Food } from '$modules/foods/types';
import type { PageLoad } from './$types';
import { getAllCategories } from '$modules/categories/api';
import type { Category } from '$modules/categories/types';


export const load: PageLoad = async () => {
	await initDefaultFoods();
	const foods = await getAllFoods();

	// Orden alfabético por nombre (ya con tildes y mayúsculas)
	foods.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

	const categories = await getAllCategories();
	categories.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

	return {
		foods,
		categories
	};
};

