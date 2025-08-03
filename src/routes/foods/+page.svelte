<script lang="ts">
	import FoodCard from '$components/FoodCard.svelte';
	import CardList from '$components/CardList.svelte';
	import HeaderActions from '$components/HeaderActions.svelte';
	import FoodForm from '$components/FoodForm.svelte';
	import Modal from '$components/Modal.svelte';
	import { Plus } from 'lucide-svelte';
	import { createFood, updateFood, deleteFood } from '$modules/foods/api';
	import type { Food } from '$modules/foods/types';
	import type { FoodFormData } from '$modules/foods/formSchema';
	import { Timestamp } from 'firebase/firestore';
	import type { Category } from '$modules/categories/types';
	import FiltersRow from '$components/FiltersRow.svelte';

	export let data: { foods: Food[]; categories: Category[] };

	let foods = [...data.foods];
	let categories = [...data.categories];

	let showModal = false;
	let isEditMode = false;
	let selectedFood: Food | null = null;
	let newCreatedId: string | null = null;

	let searchTerm = '';
	let selectedCategory = '';
	let sortOption = 'name-asc';

	// Filtro reactivo por búsqueda, categoría y ordenación
	$: filteredFoods = foods
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
		.filter((f) => selectedCategory === '' || f.categoryId === selectedCategory)
		.sort((a, b) => {
			if (newCreatedId) return 0;
			switch (sortOption) {
				case 'name-asc':
					return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
				case 'name-desc':
					return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });
				case 'calories-asc':
					return a.calories - b.calories;
				case 'calories-desc':
					return b.calories - a.calories;
				case 'proteins-asc':
					return a.proteins - b.proteins;
				case 'proteins-desc':
					return b.proteins - a.proteins;
				case 'carbs-asc':
					return a.carbs - b.carbs;
				case 'carbs-desc':
					return b.carbs - a.carbs;
				case 'fat-asc':
					return a.fat - b.fat;
				case 'fat-desc':
					return b.fat - a.fat;
				default:
					return 0;
			}
		});

	async function handleCreateFood(event: CustomEvent<FoodFormData>) {
		const formData = event.detail;

		const id = await createFood(formData);

		const newFood: Food = {
			id,
			...formData,
			createdAt: Timestamp.fromDate(new Date()),
			updatedAt: Timestamp.fromDate(new Date())
		};

		newCreatedId = newFood.id;
		foods = [newFood, ...foods];
		showModal = false;

		setTimeout(() => {
			newCreatedId = null;
		}, 2000);
	}

	async function handleUpdateFood(event: CustomEvent<FoodFormData>) {
		if (!selectedFood?.id) return;

		const foodId = selectedFood.id;
		const formData = event.detail;

		await updateFood(foodId, {
			...formData,
			updatedAt: Timestamp.fromDate(new Date())
		});

		foods = foods
			.map((f) =>
				f.id === foodId ? { ...f, ...formData, updatedAt: Timestamp.fromDate(new Date()) } : f
			)
			.sort((a, b) => a.name.localeCompare(b.name));

		showModal = false;
		isEditMode = false;
		selectedFood = null;
	}

	async function handleDeleteFood(foodId: string) {
		const confirmed = confirm('¿Estás seguro de que quieres eliminar este alimento?');
		if (!confirmed) return;
		await deleteFood(foodId);
		foods = foods.filter((f) => f.id !== foodId);
	}

	function openEditModal(food: Food) {
		showModal = true;
		isEditMode = true;
		selectedFood = food;
	}
</script>

<HeaderActions title="Alimentos" maxWidth="800px">
	<button class="btn-icon" on:click={() => (showModal = true)}>
		<Plus />
		<span>Nuevo alimento</span>
	</button>
</HeaderActions>

<FiltersRow
	showSearch={true}
	showFilter={true}
	showSort={true}
	filterOptions={categories}
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
	on:filter={(e) => (selectedCategory = e.detail)}
	on:sort={(e) => (sortOption = e.detail)}
/>

<div class="scroll-area dynamic" style="--scroll-offset: 13rem; max-width: 800px;">
	<CardList maxWidth="800px">
		{#each filteredFoods as food (food.id)}
			<FoodCard
				name={food.name}
				categoryIcon={food.categoryIcon}
				categoryColor={food.categoryColor}
				calories={food.calories}
				proteins={food.proteins}
				carbs={food.carbs}
				fat={food.fat}
				isNew={food.id === newCreatedId}
				onEdit={() => openEditModal(food)}
				onDelete={() => food.id && handleDeleteFood(food.id)}
			/>
		{/each}
	</CardList>
</div>

{#if showModal}
	<Modal
		onClose={() => {
			showModal = false;
			isEditMode = false;
			selectedFood = null;
		}}
		title={isEditMode ? 'Editar alimento' : 'Nuevo alimento'}
		maxWidth="700px"
	>
		<FoodForm
			initialData={selectedFood ?? {
				name: '',
				categoryId: '',
				categoryName: '',
				categoryIcon: '',
				categoryColor: '',
				calories: '' as unknown as number,
				proteins: '' as unknown as number,
				carbs: '' as unknown as number,
				fat: '' as unknown as number
			}}
			{isEditMode}
			{categories}
			on:submit={isEditMode ? handleUpdateFood : handleCreateFood}
		/>
	</Modal>
{/if}

<style>
	@media (max-width: 768px) {
		.scroll-area.dynamic {
			padding-bottom: 8rem;
		}
	}
</style>
