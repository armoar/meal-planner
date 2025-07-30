<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Food } from '$modules/foods/types';
	import FiltersRow from './FiltersRow.svelte';

	export let open: boolean;
	export let foods: Food[] = [];

	export let categories: { id: string; name: string; icon: string }[] = [];

	const dispatch = createEventDispatcher();
	let searchTerm = '';
	let selectedCategoryId = '';
	let itemsToShow = 50;

	$: filteredFoods = foods.filter((f) => {
		const matchesName = f.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
		const matchesCategory = selectedCategoryId ? f.categoryId === selectedCategoryId : true;
		return matchesName && matchesCategory;
	});

	$: visibleFoods = searchTerm.trim()
		? filteredFoods // si se está buscando, se muestra todo el resultado filtrado
		: filteredFoods.slice(0, itemsToShow); // paginación

	function selectFood(food: FoodPreview) {
		dispatch('select', food);
		open = false;
	}

	type FoodPreview = {
		id: string;
		name: string;
		categoryName: string;
		categoryIcon: string;
		categoryColor: string;
		calories: number;
		proteins: number;
		carbs: number;
		fat: number;
	};
</script>

{#if open}
	<div class="modal-overlay">
		<div class="modal-content">
			<div class="modal-header">
				<h2>Seleccionar Alimento</h2>
				<button
					class="btn-text"
					on:click={() => (open = false)}
					style="position: absolute; top: 2rem; right: 2.5rem;"
					aria-label="Cerrar modal"
				>
					<X />
				</button>
			</div>

			<FiltersRow
				showSort={false}
				maxWidth="100%"
				filterOptions={categories}
				on:search={(e) => (searchTerm = e.detail)}
				on:filter={(e) => (selectedCategoryId = e.detail)}
			/>

			<div class="food-list">
				{#if filteredFoods.length === 0}
					<p style="color: var(--color-muted); text-align: center; margin-top: 1rem;">
						No se han encontrado alimentos.
					</p>
				{:else}
					{#each visibleFoods as food}
						<button type="button" class="card food-card" on:click={() => selectFood(food)}>
							<div class="food-card__main">
								<div class="food-card__icon" style="background-color: {food.categoryColor}">
									{food.categoryIcon}
								</div>
								<h3 class="food-card__name">{food.name}</h3>
							</div>

							<div class="food-card__nutrients">
								<div class="nutrient">
									<span class="nutrient-label">Kcal</span>
									<span class="nutrient-value">{food.calories}</span>
								</div>
								<div class="nutrient">
									<span class="nutrient-label">Proteínas</span>
									<span class="nutrient-value">{food.proteins} g</span>
								</div>
								<div class="nutrient">
									<span class="nutrient-label">Hidratos</span>
									<span class="nutrient-value">{food.carbs} g</span>
								</div>
								<div class="nutrient">
									<span class="nutrient-label">Grasas</span>
									<span class="nutrient-value">{food.fat} g</span>
								</div>
							</div>
						</button>
					{/each}
				{/if}
				{#if !searchTerm && filteredFoods.length > itemsToShow}
					<button
						class="btn-secondary"
						style="margin-top: 1rem;"
						on:click={() => (itemsToShow += 50)}
						aria-label="Cargar más alimentos"
					>
						Cargar más
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-modal);
	}

	.modal-content {
		background: white;
		border-radius: var(--radius-md);
		padding: 1rem;
		width: 90%;
		max-width: 500px;
		box-shadow: var(--shadow-lg);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.food-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.food-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 3rem;
		width: 100%;
	}

	.food-card__main {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 180px;
	}

	.food-card__icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
	}

	.food-card__name {
		font-size: 1rem;
		font-weight: 600;
	}

	.food-card__nutrients {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		min-width: 200px;
		border: 1px solid var(--color-surface-700);
		border-radius: var(--radius-md);
		padding: 0.5rem 1.5rem;
	}

	.nutrient {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	.nutrient-value {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text);
	}
</style>
