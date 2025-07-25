import { getAllCategories, initDefaultCategories } from '$modules/categories/api';

export async function load() {
	await initDefaultCategories();
	const categories = await getAllCategories();

	return {
		categories
	};
}
