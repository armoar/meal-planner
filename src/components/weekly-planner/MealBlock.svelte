<script lang="ts">
	import type { Meal } from '$modules/meals/types';
	import type { MealType } from '$modules/mealTypes/types';
	import MealItemCard from './MealItemCard.svelte';
	import { Plus } from 'lucide-svelte';

	export let mealType: MealType;
	export let meals: Meal[] = [];

	function add() {
		dispatchEvent(new CustomEvent('add'));
	}
	function onDelete(mealId: string) {
		dispatchEvent(new CustomEvent('delete', { detail: { mealId } }));
	}

	$: isEmpty = meals.length === 0;
</script>

<div class="meal-block {isEmpty ? 'is-empty' : ''}">
	<div class="meal-block__header">
		<div class="title">{mealType.name}</div>
		<button class="btn-icon-secondary" style="padding: 0.25rem 0.5rem;" on:click={add} aria-label={`Añadir a ${mealType.name}`}>
			<Plus />
		</button>
	</div>

	{#if isEmpty}
		<div class="empty">No planificado</div>
	{:else}
		<div class="meal-list">
			{#each meals as meal (meal.id)}
				<MealItemCard {meal} on:delete={(e) => onDelete(e.detail.mealId)} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.meal-block {
		height: 100%;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-surface-700);
		border-radius: var(--radius-md);
		background: #fff;
	}
	.meal-block__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.6rem;
		border-bottom: 1px solid var(--color-surface-700);
	}
	.title {
		font-weight: 600;
    font-size: 0.9rem;
	}
	.meal-list {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.5rem;
	}

	/* Estado vacío estilo “dashed” centrado (como el mock) */
	.meal-block.is-empty {
		background: transparent;
		border: 2px dashed var(--color-surface-700);
	}
	.meal-block.is-empty .meal-block__header {
		border-bottom: none;
		padding: 0.5rem 0.6rem 0.25rem;
	}
	.empty {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-muted);
		padding: 0.75rem;
	}

	@media (max-width: 768px) {
		/* ya es icon-only, no hace falta label */
	}
</style>
