<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { RecipeIngredient } from '$modules/recipes/types';
	import type { Unit } from '$modules/units/types';

	export let ingredient: RecipeIngredient;
	export let units: Unit[] = [];

	const dispatch = createEventDispatcher();

	// Datos temporales (lo ideal será tener un map global foodId → name)
	export let foodName: string = 'Alimento';

	function updateQuantity(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		dispatch('change', {
			...ingredient,
			quantity: parseFloat(value)
		});
	}

	function updateUnit(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		dispatch('change', {
			...ingredient,
			unit: value
		});
	}
</script>

<div class="food-pill">
	<div class="food-pill__main">
		<div class="food-pill__icon" style="background-color: {ingredient.categoryColor}">
			{ingredient.categoryIcon}
		</div>
		<div class="food-pill__name">{foodName}</div>

		<div class="food-pill__controls">
			<input
				type="number"
				min="0"
				step="any"
				class="input"
				value={ingredient.quantity}
				on:input={updateQuantity}
				style="padding-right: 0;"
			/>
			<select class="select" bind:value={ingredient.unit} on:change={updateUnit}>
				{#each units as u}
					<option value={u.id}>{u.symbol}</option>
				{/each}
			</select>
		</div>
	</div>
	<button
		type="button"
		class="btn-icon-remove"
		on:click={() => dispatch('remove')}
		aria-label="Eliminar ingrediente"
		style="width: 1.75rem; height: 1.75rem; padding: 0;"
	>
		<X />
	</button>
</div>

<style>
	.food-pill {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: white;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		margin-bottom: 0.5rem;
		gap: 1rem;
	}

	.food-pill__main {
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.food-pill__icon {
		width: 2rem;
		height: 2rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.food-pill__name {
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-text);
		margin: 0;
	}

	.food-pill__controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.food-pill__main {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
