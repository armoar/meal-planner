<script lang="ts">
	import HeaderActions from '$components/HeaderActions.svelte';
	import CardList from '$components/CardList.svelte';
	import RecipeCard from '$components/RecipeCard.svelte';
	import Modal from '$components/Modal.svelte';
	import RecipeForm from '$components/RecipeForm.svelte';

	import type { Recipe } from '$modules/recipes/types';
	import type { RecipeFormData } from '$modules/recipes/formSchema';
	import { createRecipe, updateRecipe, deleteRecipe } from '$modules/recipes/api';
	import { Plus } from 'lucide-svelte';
	import { Timestamp } from 'firebase/firestore';
	import type { Food } from '$modules/foods/types';
	import type { Category } from '$modules/categories/types';
	import type { Unit } from '$modules/units/types';
	import FiltersRow from '$components/FiltersRow.svelte';

	export let data: {
		recipes: Recipe[];
		foods: Food[];
		categories: Category[];
		units: Unit[];
	};

	const { foods, categories, units } = data;
	let recipes: Recipe[] = data.recipes;

	let showModal = false;
	let isEditMode = false;
	let selectedRecipe: Recipe | null = null;
	let newCreatedId: string | null = null;

	let searchTerm = '';
	let sortOption = 'name-asc';

	$: filteredRecipes = recipes
		.filter((f) =>
			f.name
				.toLowerCase()
				.normalize('NFD')
				.replace(/\p{Diacritic}/gu, '')
				.includes(
					searchTerm
						.toLowerCase()
						.normalize('NFD')
						.replace(/\p{Diacritic}/gu, '')
				)
		)
		.sort((a, b) => {
			switch (sortOption) {
				case 'name-asc':
					return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
				case 'name-desc':
					return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });
				case 'calories-asc':
					return a.totalCalories - b.totalCalories;
				case 'calories-desc':
					return b.totalCalories - a.totalCalories;
				case 'proteins-asc':
					return a.totalProteins - b.totalProteins;
				case 'proteins-desc':
					return b.totalProteins - a.totalProteins;
				case 'carbs-asc':
					return a.totalCarbs - b.totalCarbs;
				case 'carbs-desc':
					return b.totalCarbs - a.totalCarbs;
				case 'fat-asc':
					return a.totalFat - b.totalFat;
				case 'fat-desc':
					return b.totalFat - a.totalFat;
				default:
					return 0;
			}
		});

	async function handleCreateRecipe(event: CustomEvent<RecipeFormData>) {
		const formData = event.detail;

		const id = await createRecipe(formData);

		const newRecipe: Recipe = {
			id,
			...formData,
			createdAt: Timestamp.fromDate(new Date()),
			updatedAt: Timestamp.fromDate(new Date())
		};

		newCreatedId = newRecipe.id;
		recipes = [newRecipe, ...recipes];
		showModal = false;

		setTimeout(() => {
			newCreatedId = null;
		}, 2000);
	}

	async function handleUpdateRecipe(event: CustomEvent<RecipeFormData>) {
		if (!selectedRecipe?.id) return;

		const recipeId = selectedRecipe.id;
		const formData = event.detail;

		await updateRecipe(recipeId, {
			...formData,
			updatedAt: Timestamp.fromDate(new Date())
		});

		recipes = recipes
			.map((r) =>
				r.id === recipeId ? { ...r, ...formData, updatedAt: Timestamp.fromDate(new Date()) } : r
			)
			.sort((a, b) => a.name.localeCompare(b.name));

		showModal = false;
		isEditMode = false;
		selectedRecipe = null;
	}

	async function handleDeleteRecipe(recipeId: string) {
		const confirmed = confirm('¿Estás seguro de que quieres eliminar esta receta?');
		if (!confirmed) return;
		await deleteRecipe(recipeId);
		recipes = recipes.filter((r) => r.id !== recipeId);
	}

	function openEditModal(recipe: Recipe) {
	const enrichedIngredients = recipe.ingredients.map((ingredient) => {
		const food = foods.find((f) => f.id === ingredient.foodId);

		return {
			...ingredient,
			categoryIcon: food?.categoryIcon ?? '',
			categoryColor: food?.categoryColor ?? ''
		};
	});

	selectedRecipe = {
		...recipe,
		ingredients: enrichedIngredients
	};

	showModal = true;
	isEditMode = true;
}

</script>

<HeaderActions title="Recetas" maxWidth="800px">
	<button class="btn-icon" on:click={() => (showModal = true)}>
		<Plus />
		<span>Nueva receta</span>
	</button>
</HeaderActions>

<FiltersRow
	showSearch={true}
	showFilter={false}
	showSort={true}
	sortOptions={[
		{ id: 'name-asc', label: 'Nombre A-Z' },
		{ id: 'name-desc', label: 'Nombre Z-A' },
		{ id: 'calories-asc', label: 'Kcal 0-9' },
		{ id: 'calories-desc', label: 'Kcal 9-0' },
		{ id: 'proteins-asc', label: 'Proteínas 0-9' },
		{ id: 'proteins-desc', label: 'Proteínas 9-0' },
		{ id: 'carbs-asc', label: 'Hidratos 0-9' },
		{ id: 'carbs-desc', label: 'Hidratos 9-0' },
		{ id: 'fat-asc', label: 'Grasas 0-9' },
		{ id: 'fat-desc', label: 'Grasas 9-0' }
	]}
	maxWidth="800px"
	on:search={(e) => (searchTerm = e.detail)}
	on:sort={(e) => (sortOption = e.detail)}
/>

<div class="scroll-area dynamic" style="--scroll-offset: 13rem; max-width: 800px;">
	<CardList maxWidth="800px">
		{#if recipes.length === 0}
			<p style="margin-top: 1rem;">Aún no has creado ninguna receta.</p>
		{:else}
			{#each filteredRecipes as recipe(recipe.id)}
				<RecipeCard
					name={recipe.name}
					servings={recipe.servings}
					totalCalories={recipe.totalCalories}
					totalProteins={recipe.totalProteins}
					totalCarbs={recipe.totalCarbs}
					totalFat={recipe.totalFat}
					isNew={recipe.id === newCreatedId}
					onEdit={() => openEditModal(recipe)}
					onDelete={() => recipe.id && handleDeleteRecipe(recipe.id)}
				/>
			{/each}
		{/if}
	</CardList>
</div>

{#if showModal}
	<Modal
		onClose={() => {
			showModal = false;
			isEditMode = false;
			selectedRecipe = null;
		}}
		title={isEditMode ? 'Editar receta' : 'Nueva receta'}
		maxWidth="700px"
	>
		<RecipeForm
			initialData={selectedRecipe ?? {
				name: '',
				servings: 1,
				ingredients: [],
				totalCalories: '' as unknown as number,
				totalProteins: '' as unknown as number,
				totalCarbs: '' as unknown as number,
				totalFat: '' as unknown as number
			}}
			{foods}
			{categories}
			{units}
			{isEditMode}
			on:submit={isEditMode ? handleUpdateRecipe : handleCreateRecipe}
		/>
	</Modal>
{/if}
