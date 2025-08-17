<script lang="ts">
	import WeeklyPlannerHeader from '$components/weekly-planner/WeeklyPlannerHeader.svelte';
	import type { PageData } from './$types';
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
	/>

	{#if viewMode === 'weekly'}
		<div class="muted">[TODO] Vista semanal</div>
	{:else}
		<div class="muted">[TODO] Vista diaria</div>
	{/if}
</div>
