<script lang="ts">
	import type { DailyPlanView, Meal } from '$modules/weeklyPlans/types';
	import type { MealType } from '$modules/mealTypes/types';
	import MealBlock from './MealBlock.svelte';
	import { ChevronDown, ChevronRight } from 'lucide-svelte';

	export let day: DailyPlanView;
	export let mealTypes: MealType[] = [];
	export let visibleDinerIds: string[] = [];

	// Event bubbling: add/edit/delete handled arriba si quieres
	function onAdd(mealTypeId: string) {
		const detail = { dailyPlanId: day.id, date: day.date, mealTypeId };
		dispatchEvent(new CustomEvent('addMeal', { detail, bubbles: true }));
	}
	function onDelete(mealId: string) {
		const detail = { dailyPlanId: day.id, mealId };
		dispatchEvent(new CustomEvent('deleteMeal', { detail, bubbles: true }));
	}

	let open = true;

	const dateFmt = new Intl.DateTimeFormat('es-ES', {
		weekday: 'long',
		day: '2-digit',
		month: 'short'
	});
	$: title = dateFmt.format(new Date(day.date + 'T00:00:00Z'));
</script>

<div class="daily-card card">
	<button class="daily-card__header" on:click={() => (open = !open)} aria-expanded={open}>
		{#if open}<ChevronDown size="16" />{:else}<ChevronRight size="16" />{/if}
		<div class="title">{title}</div>
		<!-- KPI placeholder (cuando calculemos macros por visibleDinerIds) -->
		<div class="kpis muted">Kcal día · prot · carb · grasa</div>
	</button>

	{#if open}
		<div class="daily-card__body">
			{#each mealTypes as mt}
				<MealBlock
					mealType={mt}
					meals={day.meals.filter((m) => m.mealTypeId === mt.id)}
					on:add={() => onAdd(mt.id)}
					on:delete={(e: { detail: { mealId: string } }) => onDelete(e.detail.mealId)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.daily-card {
        width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.daily-card__header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: transparent;
		text-align: left;
		border-bottom: 1px solid var(--color-surface-700);
	}
	.daily-card__header .title {
		font-weight: 600;
		text-transform: capitalize;
	}
	.daily-card__header .kpis {
		margin-left: auto;
		font-size: 0.9rem;
	}
	.daily-card__body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.25rem 0.25rem 0.5rem 0.25rem;
	}
</style>
