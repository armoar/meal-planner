<script lang="ts">
	import WeeklyPlannerHeader from '$components/weekly-planner/WeeklyPlannerHeader.svelte';
	import SavedWeeksModal from '$components/weekly-planner/SavedWeeksModal.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import DailyPlanCard from '$components/weekly-planner/DailyPlanCard.svelte';
	export let data: PageData;

	// Helper: YYYY-MM-DD -> Date (UTC, evita saltos de TZ)
	const toDateUTC = (s: string) => {
		const [y, m, d] = s.split('-').map(Number);
		return new Date(Date.UTC(y, m - 1, d));
	};

	// Estado local
	let viewMode: 'weekly' | 'daily' = 'weekly';
	let visibleDinerIds: string[] = [...(data.participantIds ?? [])];

	function onChangeVisibleDiners(e: CustomEvent<{ visibleDinerIds: string[] }>) {
		visibleDinerIds = e.detail.visibleDinerIds;
	}

	function onChangeView(e: CustomEvent<{ viewMode: 'weekly' | 'daily' }>) {
		viewMode = e.detail.viewMode;
	}

	// Fechas para el header
	const weekStart = toDateUTC(data.weeklyPlanView.startDate);
	const weekEnd = toDateUTC(data.weeklyPlanView.endDate);

	let showSavedWeeks = false;

	function handleOpenSavedWeeks() {
		// console.log('[Page] recibido openSavedWeeks');
		showSavedWeeks = true;
	}

	function handleCloseSavedWeeks() {
		showSavedWeeks = false;
	}

	function handleSelectSavedWeek(e: CustomEvent<{ start: string }>) {
		const start = e.detail.start;
		const url = new URL(window.location.href);
		url.searchParams.set('start', start);
		goto(url.pathname + url.search);
		showSavedWeeks = false;
	}

	function handleAddMeal(
		e: CustomEvent<{ dailyPlanId: string; date: string; mealTypeId: string }>
	) {
		// Próximo paso: abrir modal de alta con estos datos
		console.log('[AddMeal]', e.detail);
		// TODO: set showMealForm = true; mealFormData = e.detail;
	}
	function handleDeleteMeal(_e: CustomEvent<{ dailyPlanId: string; mealId: string }>) {
		// No hace falta nada: MealItemCard ya borró en DB; para refrescar,
		// puedes volver a cargar la página o quitar el item del estado local si lo gestionas aquí.
		// Por ahora, recarga suave:
		location.reload();
	}
</script>

<div class="route-container">
	<WeeklyPlannerHeader
		{weekStart}
		{weekEnd}
		weeklyPlanId={data.weeklyPlanId}
		diners={data.allDiners}
		{visibleDinerIds}
		materializedWeeks={data.materializedWeeks}
		{viewMode}
		on:changeVisibleDiners={onChangeVisibleDiners}
		on:changeView={onChangeView}
		on:openSavedWeeks={handleOpenSavedWeeks}
	/>

	<SavedWeeksModal
		open={showSavedWeeks}
		weeks={data.materializedWeeks}
		currentStart={data.weeklyPlanView.startDate}
		on:close={handleCloseSavedWeeks}
		on:select={handleSelectSavedWeek}
	/>

	{#if viewMode === 'weekly'}
  <div class="weekly-list">
    {#each data.weeklyPlanView.dailyPlans as day (day.id)}
      <DailyPlanCard
        {day}
        mealTypes={data.mealTypes}
        visibleDinerIds={visibleDinerIds}
        on:addMeal={handleAddMeal}
        on:deleteMeal={handleDeleteMeal}
      />
    {/each}
  </div>
{:else}
  <div class="muted">[TODO] Vista diaria</div>
{/if}

</div>

<style>
	.weekly-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

</style>
