<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import type { Diner } from '$modules/diners/types';
	import { BookMarked, Columns3, ChevronRight, ChevronLeft, List } from 'lucide-svelte';
	import DinerMultiSelect from '$components/diner/DinerMultiSelect.svelte';
	import { createWeeklyPlan, updateWeeklyPlanDiners } from '$modules/weeklyPlans/api';

	export let weekStart: Date;
	export let weekEnd: Date;
	export let diners: Diner[] = [];
	export let visibleDinerIds: string[] = [];
	export let viewMode: 'weekly' | 'daily' = 'weekly';
	export let weeklyPlanId: string | null = null;

	const dispatch = createEventDispatcher();
	const toISO = (d: Date) => d.toISOString().slice(0, 10);

	function addDays(date: Date, days: number) {
		const d = new Date(date);
		d.setDate(d.getDate() + days);
		return d;
	}
	function navigateToWeek(start: Date) {
		const iso = toISO(start);
		goto(`/weekly-plans/${iso}`);
	}
	function prevWeek() {
		navigateToWeek(addDays(weekStart, -7));
	}
	function nextWeek() {
		navigateToWeek(addDays(weekStart, +7));
	}

	function goToList() {
		goto('/weekly-planner');
	}

	async function saveParticipants(ids: string[]) {
		try {
			let targetWeeklyPlanId = weeklyPlanId;
			const startDateString = toISO(weekStart);
			if (!targetWeeklyPlanId) {
				const { id } = await createWeeklyPlan(startDateString, ids);
				targetWeeklyPlanId = id;
				weeklyPlanId = id;
			}
			const dinersPayload = diners.map((d) => ({ dinerId: d.id, included: ids.includes(d.id) }));
			await updateWeeklyPlanDiners(targetWeeklyPlanId!, dinersPayload);
			dispatch('changeVisibleDiners', { visibleDinerIds: ids });
		} catch (e) {
			console.error('Error al guardar comensales de la semana', e);
		}
	}

	function setView(mode: 'weekly' | 'daily') {
		if (mode !== viewMode) dispatch('changeView', { viewMode: mode });
	}

	$: weekLabel =
		new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(weekStart) +
		' - ' +
		new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(
			weekEnd
		);
</script>

<div class="planner-header">
	<div class="planner-header__top">
		<h1 class="planner-header__title">Planificador semanal</h1>

		<div class="planner-header__top-right">
			<button class="btn-icon-secondary" on:click={goToList}>
				<List /><span class="view-label">Volver al listado</span>
			</button>

			<div class="view-toggle">
				<button
					class="btn-icon-secondary {viewMode === 'weekly' ? 'btn-selected' : ''}"
					on:click={() => setView('weekly')}
				>
					<Columns3 /><span class="view-label">Vista semanal</span>
				</button>
				<button
					class="btn-icon-secondary {viewMode === 'daily' ? 'btn-selected' : ''}"
					on:click={() => setView('daily')}
				>
					<BookMarked /><span class="view-label">Vista diaria</span>
				</button>
			</div>
		</div>
	</div>

	<div class="planner-header__bottom">
		<div class="planner-header__bottom-left">
			<button class="btn-icon-secondary round" on:click={prevWeek}><ChevronLeft size="22" /></button
			>
			<div class="week-range">{weekLabel}</div>
			<button class="btn-icon-secondary round" on:click={nextWeek}
				><ChevronRight size="22" /></button
			>

			<div class="bottom-actions">
				<div class="diner-wrapper">
					<DinerMultiSelect
						{diners}
						selectedIds={visibleDinerIds}
						label="Comensales"
						onSave={saveParticipants}
					/>
				</div>
			</div>
		</div>

		<div class="planner-header__bottom-center"></div>
		<div class="planner-header__bottom-right"></div>
	</div>
</div>

<style>
	/* (idéntico a tu versión previa; lo dejo tal cual) */
	.planner-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 0;
		margin-bottom: 1rem;
	}
	.planner-header__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding-bottom: 1rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-surface-700);
	}
	.planner-header__title {
		font-size: 1.7rem;
		font-weight: 600;
		color: var(--color-primary-950);
		margin-bottom: 0.25rem;
	}
	.planner-header__top-right {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.view-toggle {
		display: flex;
		gap: 0.5rem;
	}
	.round {
		border-radius: 9999px;
	}
	.planner-header__bottom {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.planner-header__bottom-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.bottom-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.diner-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.week-range {
		font-weight: 500;
		min-width: 150px;
		text-align: center;
	}
	.view-label {
		display: inline;
	}
	@media (max-width: 768px) {
		.planner-header__top {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
		.planner-header__top-right {
			width: 100%;
			justify-content: flex-start;
		}
		.view-toggle {
			width: 100%;
			display: flex;
			justify-content: left;
			gap: 0.5rem;
		}
		.view-label {
			display: none;
		}
		.btn-selected .view-label {
			display: inline;
		}
		.planner-header__bottom {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}
		.bottom-actions {
			display: grid;
			grid-template-columns: 1fr;
			gap: 0.5rem;
			width: 100%;
		}
		.diner-wrapper {
			width: 100%;
		}
		.diner-wrapper :global(button) {
			width: 100%;
			justify-content: center;
			color: transparent;
		}
	}
</style>
