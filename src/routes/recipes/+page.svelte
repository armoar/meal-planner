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
	let selectedCategory = '';
	let sortOption = 'name-asc';

	function openCreate() {
		selectedRecipe = null;
		showModal = true;
	}

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
		showModal = true;
		isEditMode = true;
		selectedRecipe = recipe;
	}
</script>

<HeaderActions title="Recetas" maxWidth="800px">
	<button class="btn-icon" on:click={() => (showModal = true)}>
		<Plus />
		<span>Nueva receta</span>
	</button>
</HeaderActions>

<div class="scroll-area dynamic" style="--scroll-offset: 13rem; max-width: 800px;">
	<CardList maxWidth="800px">
		{#if recipes.length === 0}
			<p style="margin-top: 1rem;">Aún no has creado ninguna receta.</p>
		{:else}
			{#each recipes as recipe}
				<RecipeCard
					name={recipe.name}
					servings={recipe.servings}
					totalCalories={recipe.totalCalories}
					totalProteins={recipe.totalProteins}
					totalCarbs={recipe.totalCarbs}
					totalFat={recipe.totalFat}
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
				servings: '' as unknown as number,
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
