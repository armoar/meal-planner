<script lang="ts">
	import type { PageData } from './$types';
	import HeaderActions from '$components/HeaderActions.svelte';
	import FiltersRow from '$components/FiltersRow.svelte';
	import CardList from '$components/CardList.svelte';
	import WeeklyPlanCard from '$components/weekly-planner/WeeklyPlanCard.svelte';
	import CreatePlanModal from '$components/weekly-planner/CreateWeeklyPlanModal.svelte';
	import { Plus, ChevronDown, ChevronRight } from 'lucide-svelte';
	import { deleteWeeklyPlan } from '$modules/weeklyPlans/api';
	import { goto } from '$app/navigation';
	import type { WeeklyPlan } from '$modules/weeklyPlans/types';

	import {
		seedAllWeeklyPlansDev,
		nukeAllWeeklyPlansCascade,
		wipeOnlyMeals
	} from '$modules/weeklyPlans/devSeed';

	// flag DEV
	const IS_DEV = import.meta.env.DEV;

	let statusMsg = '';
	let isWorking = false;

	async function handleSeed() {
		isWorking = true;
		statusMsg = 'Sembrando dataset...';
		try {
			const res = await seedAllWeeklyPlansDev();
			statusMsg = `OK: creados ${res.created.length} weeklyPlans. Años: ${Object.keys(res.byYear).join(', ')}`;
			console.log('[seed] Detalle:', res);
		} catch (e: any) {
			statusMsg = `Error en seed: ${e?.message ?? e}`;
			console.error(e);
		} finally {
			isWorking = false;
		}
	}

	async function handleWipeMeals() {
		isWorking = true;
		statusMsg = 'Borrando SOLO meals...';
		try {
			const n = await wipeOnlyMeals();
			statusMsg = `OK: borrados ${n} meals.`;
		} catch (e: any) {
			statusMsg = `Error al borrar meals: ${e?.message ?? e}`;
			console.error(e);
		} finally {
			isWorking = false;
		}
	}

	async function handleNuke() {
		if (!confirm('¿Seguro? Esto borrará TODO (meals, dailyPlans y weeklyPlans).')) return;
		isWorking = true;
		statusMsg = 'Borrando TODO en cascada...';
		try {
			const res = await nukeAllWeeklyPlansCascade();
			statusMsg = `OK: borrados ${res.meals} meals, ${res.dailyPlans} dailyPlans y ${res.weeklyPlans} weeklyPlans.`;
			console.log('[nuke] Detalle:', res);
		} catch (e: any) {
			statusMsg = `Error en nuke: ${e?.message ?? e}`;
			console.error(e);
		} finally {
			isWorking = false;
		}
	}

	export let data: PageData; // { plans, grouped, yearsSorted, monthsByYear }

	let plans: WeeklyPlan[] = data.plans;

	// ===== Filtros mínimos (fechas) =====
	let searchTerm = '';
	let sortOption: 'date-desc' | 'date-asc' = 'date-desc';
	const sortOptions = [
		{ id: 'date-desc', label: 'Más recientes primero' },
		{ id: 'date-asc', label: 'Más antiguos primero' }
	];

	$: filteredPlans = plans
		.filter((p) => {
			if (!searchTerm) return true;
			const txt = `${p.startDate} ${p.endDate}`.toLowerCase();
			return txt.includes(searchTerm.toLowerCase());
		})
		.sort((a, b) =>
			sortOption === 'date-asc'
				? a.startDate.localeCompare(b.startDate)
				: b.startDate.localeCompare(a.startDate)
		);

	type GroupedArr = { year: string; months: { month: string; plans: WeeklyPlan[] }[] }[];
	let groupedArr: GroupedArr = [];

	$: {
		const map = new Map<string, Map<string, WeeklyPlan[]>>();
		for (const p of filteredPlans) {
			const [y, m] = p.startDate.split('-');
			if (!map.has(y)) map.set(y, new Map());
			const mm = map.get(y)!;
			if (!mm.has(m)) mm.set(m, []);
			mm.get(m)!.push(p);
		}
		const cmp =
			sortOption === 'date-asc'
				? (a: string, b: string) => a.localeCompare(b)
				: (a: string, b: string) => b.localeCompare(a);

		groupedArr = [...map.keys()].sort(cmp).map((y) => ({
			year: y,
			months: [...map.get(y)!.keys()].sort(cmp).map((m) => ({
				month: m,
				plans: map.get(y)!.get(m)! // ya preserva el orden de filteredPlans
			}))
		}));
	}

	// helpers para expand/collapse
	const yearsKeys = () => groupedArr.map((g) => g.year);
	const ymKey = (y: string, m: string) => `${y}-${m}`;

	// ===== Expand/Collapse =====
	let expandedYears = new Set<string>();
	let expandedMonths = new Set<string>(); // "YYYY-MM"
	const expandAll = () => {
		expandedYears = new Set(yearsKeys());
		expandedMonths = new Set(
			groupedArr.flatMap((g) => g.months.map((mm) => ymKey(g.year, mm.month)))
		);
	};
	const collapseAll = () => {
		expandedYears = new Set();
		expandedMonths = new Set();
	};
	const toggleYear = (y: string) => {
		expandedYears.has(y) ? expandedYears.delete(y) : expandedYears.add(y);
		expandedYears = new Set(expandedYears);
	};
	const toggleMonth = (y: string, m: string) => {
		const k = ymKey(y, m);
		expandedMonths.has(k) ? expandedMonths.delete(k) : expandedMonths.add(k);
		expandedMonths = new Set(expandedMonths);
	};

	// ===== Crear plan =====
	let showCreate = false;
	const openCreate = () => (showCreate = true);
	const closeCreate = () => (showCreate = false);
	function handleCreated(e: CustomEvent<{ id: string; start: string }>) {
		showCreate = false;
		goto(`/weekly-planner/${e.detail.start}`);
	}

	// ===== Acciones =====
	const viewPlan = (start: string) => goto(`/weekly-planner/${start}`);
	async function removePlan(id: string) {
		if (!confirm('¿Eliminar este plan y todo su contenido?')) return;
		await deleteWeeklyPlan(id, true);
		location.reload();
	}

	function monthLabel(y: string, m: string) {
		const dt = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
		const name = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(dt);
		return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
	}
</script>

<HeaderActions title="Planes semanales" maxWidth="960px">
	<div class="header-right">
		<button class="btn-icon" on:click={openCreate}><Plus /><span>Crear plan</span></button>
	</div>
</HeaderActions>

<!--
	{#if IS_DEV}
	  <div class="card" style="max-width:960px; margin-bottom:.5rem; display:flex; gap:.5rem; flex-wrap:wrap; align-items:center;">
		<strong>DEV:</strong>
		<button class="btn-icon" on:click={handleSeed} disabled={isWorking}>Seed dataset</button>
		<button class="btn-icon-secondary" on:click={handleWipeMeals} disabled={isWorking}>Borrar SOLO meals</button>
		<button class="btn-icon-warning" on:click={handleNuke} disabled={isWorking}>Borrar TODO en cascada</button>
		{#if statusMsg}<span style="margin-left:.5rem; color: var(--color-muted);">{statusMsg}</span>{/if}
	  </div>
	{/if}
-->
<div class="filters-row-weekly-plans">
	<FiltersRow
		showSearch={false}
		showFilter={false}
		showSort={true}
		{sortOptions}
		maxWidth="960px"
		on:search={(e) => (searchTerm = e.detail)}
		on:sort={(e) => (sortOption = e.detail)}
	/>
	<div class="expand-controls">
		<button class="btn-text" on:click={expandAll}>Expandir todo</button>
		<button class="btn-text" on:click={collapseAll}>Contraer todo</button>
	</div>
</div>

<div class="scroll-area dynamic" style="--scroll-offset: 12rem; max-width: 960px;">
	{#if groupedArr.length === 0}
		<div class="card"><p class="muted">No hay planes. Crea el primero con “Crear plan”.</p></div>
	{:else}
		{#each groupedArr as g}
			<div class="year-block card">
				<button
					class="row year-row"
					on:click={() => toggleYear(g.year)}
					aria-expanded={expandedYears.has(g.year)}
				>
					{#if expandedYears.has(g.year)}<ChevronDown size="18" />{:else}<ChevronRight
							size="18"
						/>{/if}
					<span class="year-label">{g.year}</span>
					<span class="pill">{g.months.reduce((s, mm) => s + mm.plans.length, 0)} semanas creadas</span>
				</button>

				{#if expandedYears.has(g.year)}
					<div class="months">
						{#each g.months as mm}
							<div class="month-block">
								<button
									class="row month-row"
									on:click={() => toggleMonth(g.year, mm.month)}
									aria-expanded={expandedMonths.has(ymKey(g.year, mm.month))}
								>
									{#if expandedMonths.has(ymKey(g.year, mm.month))}<ChevronDown
											size="16"
										/>{:else}<ChevronRight size="16" />{/if}
									<span class="month-label">{monthLabel(g.year, mm.month)}</span>
								</button>

								{#if expandedMonths.has(ymKey(g.year, mm.month))}
									<div class="weekly-plans">
										<CardList maxWidth="960px">
											{#each mm.plans as plan (plan.id)}
												<WeeklyPlanCard
													startDate={plan.startDate}
													endDate={plan.endDate}
													onView={() => viewPlan(plan.startDate)}
													onDelete={() => removePlan(plan.id)}
												/>
											{/each}
										</CardList>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<CreatePlanModal open={showCreate} on:close={closeCreate} on:created={handleCreated} />

<style>
	.header-right {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.row {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 0.55rem 0.65rem;
		text-align: left;
		background: transparent;
	}
	.filters-row-weekly-plans {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		max-width: 960px;
	}

	:global(.filters-row) {
		width: auto !important; /* sobreescribe el 100% interno */
		max-width: none !important;
		flex: 1 1 auto; /* ocupa solo lo necesario y permite hueco */
		min-width: 0;
	}

	.expand-controls {
		display: flex;
		gap: 0.5rem;
		flex: 0 0 auto;
		margin-bottom: 1rem;
	}
	.weekly-plans {
		padding: 0.5rem;
	}

	.scroll-area {
		gap: 0.5rem;
	}
	.year-block {
		padding: 1rem;
		margin-bottom: 0.6rem;
		background-color: white;
		z-index: 1;
	}
	.year-label {
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-primary-950);
	}
	.months {
		padding: 0.25rem;
		padding-left: 1rem;
	}
	.month-block {
		padding: 0.5rem;
		border-top: 1px dashed var(--color-surface-700);
	}
	.month-label {
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-primary-950);
	}
	.pill {
		margin-left: auto;
		font-size: 0.85rem;
		color: var(--color-muted);
		background: var(--color-surface-50, #f8f9fa);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		border: 1px solid var(--color-surface-700);
	}
	@media (max-width: 768px) {
		.scroll-area.dynamic {
			padding-bottom: 8rem;
		}
		.filters-row-weekly-plans {
			gap: 0;
      flex-wrap: wrap;
	  margin-bottom: 1rem;
    }
    .expand-controls {
      width: 100%;
      justify-content: flex-start;
    }
	.year-row {
		padding-bottom: 1.5rem;
	}
	.months {
		padding: 0rem;
	}
	.month-block {
		padding-top: 1rem;
	}
	.weekly-plans {
		padding-bottom: 1.5rem;
	}
	}
</style>
