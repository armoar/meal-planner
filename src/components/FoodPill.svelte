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

<div class="ingredient-pill">
	<div class="ingredient-pill__main">
		<p class="ingredient-pill__name">{foodName}</p>

		<div class="ingredient-pill__controls">
			<input
				type="number"
				min="0"
				step="any"
				class="input"
				value={ingredient.quantity}
				on:input={updateQuantity}
				style="max-width: 5rem;"
			/>
			<select class="select" bind:value={ingredient.unit} on:change={updateUnit}>
				{#each units as u}
					<option value={u.id}>{u.symbol}</option>
				{/each}
			</select>
		</div>
	</div>

	<button class="btn-icon-warning" on:click={() => dispatch('remove')} aria-label="Eliminar ingrediente">
		<X size="16" />
	</button>
</div>

<style>
	.ingredient-pill {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--color-surface-500);
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		margin-bottom: 0.5rem;
		gap: 1rem;
	}

	.ingredient-pill__main {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.ingredient-pill__name {
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-text);
		margin: 0;
	}

	.ingredient-pill__controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
