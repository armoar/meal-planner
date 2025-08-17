<script lang="ts">
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import type { Diner } from '$modules/diners/types';
	import { BookMarked, Columns3, ChevronRight, ChevronLeft, List } from 'lucide-svelte';
	import DinerMultiSelect from '$components/diner/DinerMultiSelect.svelte';
  import { materializeWeeklyPlan, updateWeeklyPlanDiners } from '$modules/weeklyPlans/api';

	export let weekStart: Date;
	export let weekEnd: Date;
	export let diners: Diner[] = [];
	export let visibleDinerIds: string[] = [];
	export let materializedWeeks: (string | Date)[] = [];
	export let viewMode: 'weekly' | 'daily' = 'weekly';

	const dispatch = createEventDispatcher();

	const toISO = (d: Date) => d.toISOString().slice(0, 10);
	const parseToDate = (v: string | Date) => (typeof v === 'string' ? new Date(v + 'T00:00:00') : v);

	function addDays(date: Date, days: number) {
		const d = new Date(date);
		d.setDate(d.getDate() + days);
		return d;
	}

	function navigateToWeek(start: Date) {
		const iso = toISO(start);
		const url = new URL(window.location.href);
		url.searchParams.set('start', iso);
		goto(url.pathname + url.search);
	}

	function prevWeek() {
		navigateToWeek(addDays(weekStart, -7));
	}

	function nextWeek() {
		navigateToWeek(addDays(weekStart, +7));
	}

	function onSelectMaterializedWeek(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		if (value) navigateToWeek(parseToDate(value));
	}

	export let weeklyPlanId: string | null = null;

	async function saveParticipants(ids: string[]) {
  try {
    let targetWeeklyPlanId = weeklyPlanId;
    const startDateString = toISO(weekStart); // 'YYYY-MM-DD'

    // Si la semana es virtual, materializamos antes de guardar
    if (!targetWeeklyPlanId) {
      const result = await materializeWeeklyPlan(startDateString, ids);
      targetWeeklyPlanId = result.weeklyPlanId;   // <- no 'id'
      weeklyPlanId = targetWeeklyPlanId;          // opcional: fija localmente
      // opcional: avisa al padre si quieres refrescar
      // dispatch('materialized', { weeklyPlanId });
    }

    // Payload { dinerId, included }
    const dinersPayload: Array<{ dinerId: string; included: boolean }> = diners.map((d) => ({
      dinerId: d.id,
      included: ids.includes(d.id)
    }));

    // 3 argumentos: id, payload, startDateString
    await updateWeeklyPlanDiners(targetWeeklyPlanId, dinersPayload, startDateString);

    // sincroniza selección visible en la UI
    dispatch('changeVisibleDiners', { visibleDinerIds: ids });
  } catch (e) {
    console.error('Error al guardar comensales de la semana', e);
  }
}

	function setView(mode: 'weekly' | 'daily') {
		if (mode !== viewMode) dispatch('changeView', { viewMode: mode });
	}

	$: weekLabel =
		new Intl.DateTimeFormat('es-ES', {
			day: '2-digit',
			month: 'short'
		}).format(weekStart) +
		' - ' +
		new Intl.DateTimeFormat('es-ES', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}).format(weekEnd);
</script>

<div class="planner-header">
	<!-- Fila 1 -->
	<div class="planner-header__top">
		<h1 class="planner-header__title">Planificador semanal</h1>

		<div class="planner-header__top-right">
			<div class="view-toggle">
				<button
					class="btn-icon-secondary {viewMode === 'weekly' ? 'btn-selected' : ''}"
					on:click={() => setView('weekly')}
				>
					<Columns3 />
					<span class="view-label">Vista semanal</span>
				</button>

				<button
					class="btn-icon-secondary {viewMode === 'daily' ? 'btn-selected' : ''}"
					on:click={() => setView('daily')}
				>
					<BookMarked />
					<span class="view-label">Vista diaria</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Fila 2 -->
	<div class="planner-header__bottom">
		<div class="planner-header__bottom-left">
			<List style="width: 1.1rem; height: 1.1rem; color: var(--color-muted);" />
			<select class="input" on:change={onSelectMaterializedWeek}>
				<option value="">Semanas guardadas…</option>
				{#each [...materializedWeeks].sort((a, b) => parseToDate(b).getTime() - parseToDate(a).getTime()) as w}
					<option value={typeof w === 'string' ? w : toISO(w)}>
						{new Intl.DateTimeFormat('es-ES', {
							day: '2-digit',
							month: 'short',
							year: 'numeric'
						}).format(parseToDate(w))}
					</option>
				{/each}
			</select>
		</div>

		<div class="planner-header__bottom-center">
			<button class="btn-icon-secondary" style="border-radius: 9999px;" on:click={prevWeek}>
				<ChevronLeft size="30px" />
			</button>
			<div class="week-range">{weekLabel}</div>
			<button class="btn-icon-secondary" style="border-radius: 9999px;" on:click={nextWeek}>
				<ChevronRight size="30px" />
			</button>
		</div>

		<div class="planner-header__bottom-right">
			<DinerMultiSelect
				{diners}
				selectedIds={visibleDinerIds}
				label="Comensales"
				onSave={saveParticipants}
			/>
		</div>
	</div>
</div>

<style>
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
		gap: 1rem;
	}

	.planner-header__bottom-center {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 auto;
	}

	.planner-header__bottom-left {
		display: flex;
		align-items: center;
		gap: 1rem;
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
			justify-content: left; /* centrados en el div */
			gap: 0.5rem;
		}

		/* Oculta textos por defecto */
		.view-label {
			display: none;
		}

		/* El botón seleccionado sí muestra el texto */
		.btn-selected .view-label {
			display: inline;
		}

		.planner-header__bottom {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}

		.planner-header__bottom-left,
		.planner-header__bottom-center,
		.planner-header__bottom-right {
			width: 100%;
			justify-content: flex-start;
		}

		.planner-header__bottom-center {
			justify-content: center;
		}

	}
</style>
