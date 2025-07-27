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

	export let data: { foods: Food[] };

	let showModal = false;
	let foods = [...data.foods]; // Estado local para el listado
	let isEditMode = false;
	let selectedFood: Food | null = null;
	let newCreatedId: string | null = null;

	async function handleCreateFood(event: CustomEvent<FoodFormData>) {
		const formData = event.detail;

		await createFood(formData);

		const newFood: Food = {
			id: crypto.randomUUID(), // Este ID es temporal, luego puedes obtener el real si lo necesitas
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

<div style="max-width: 700px; width: 100%;">
	<HeaderActions title="Alimentos">
		<button class="btn-icon" on:click={() => (showModal = true)}>
			<Plus />
			<span>Nuevo alimento</span>
		</button>
	</HeaderActions>

	<div class="scroll-area">
		<CardList>
			{#each foods as food (food.id)}
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
		>
			<FoodForm
				initialData={selectedFood ?? {
					name: '',
					categoryId: '',
					categoryName: '',
					categoryIcon: '',
					categoryColor: '',
					calories: 0,
					proteins: 0,
					carbs: 0,
					fat: 0
				}}
				{isEditMode}
				on:submit={isEditMode ? handleUpdateFood : handleCreateFood}
			/>
		</Modal>
	{/if}
</div>
