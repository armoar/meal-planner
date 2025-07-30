import type { PageLoad } from './$types';
import { getAllRecipes } from '$modules/recipes/api';
import { getAllFoods } from '$modules/foods/api';
import { getAllCategories } from '$modules/categories/api';
import { getAllUnits } from '$modules/units/api';

export const load: PageLoad = async () => {
	const [recipes, foods, categories, units] = await Promise.all([
		getAllRecipes(),
		getAllFoods(),
		getAllCategories(),
		getAllUnits()
	]);

	return {
		recipes,
		foods,
		categories,
		units
	};
};
