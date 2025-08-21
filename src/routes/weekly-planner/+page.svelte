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

	import { seedAllWeeklyPlansDev, nukeAllWeeklyPlansCascade, wipeOnlyMeals } from '$modules/weeklyPlans/devSeed';

	// flag DEV
	const IS_DEV = import.meta.env.DEV;

	let statusMsg = '';
  let isWorking = false;

  async function handleSeed() {
    isWorking = true; statusMsg = 'Sembrando dataset...';
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
    isWorking = true; statusMsg = 'Borrando SOLO meals...';
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
    isWorking = true; statusMsg = 'Borrando TODO en cascada...';
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

	export let data: PageData; // { plans, grouped, yearsDesc, monthsByYear }

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

	// 1) Define el tipo una sola vez
	type Grouped = Record<string, Record<string, WeeklyPlan[]>>;

	// 2) Declara la variable con tipo (no valores)
	let grouped: Grouped = {};

	// 3) Asigna reactivamente SIN usar el alias como valor
	$: grouped = filteredPlans.reduce<Record<string, Record<string, WeeklyPlan[]>>>((acc, p) => {
		const [y, m] = p.startDate.split('-');
		acc[y] ??= {};
		(acc[y][m] ??= []).push(p);
		return acc;
	}, {});

	// Helpers
	const yearsDesc = () => Object.keys(grouped).sort((a, b) => b.localeCompare(a));
	const monthsDesc = (y: string) => Object.keys(grouped[y]).sort((a, b) => b.localeCompare(a));
	const ymKey = (y: string, m: string) => `${y}-${m}`;

	// ===== Expand/Collapse =====
	let expandedYears = new Set<string>();
	let expandedMonths = new Set<string>(); // "YYYY-MM"
	const expandAll = () => {
		const ys = yearsDesc();
		expandedYears = new Set(ys);
		expandedMonths = new Set(ys.flatMap((y) => monthsDesc(y).map((m) => ymKey(y, m))));
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
		return `${y} · ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
	}
</script>

<HeaderActions title="Planes semanales" maxWidth="960px">
	<div class="header-right">
		<button class="btn-text" on:click={expandAll}>Expandir todo</button>
		<button class="btn-text" on:click={collapseAll}>Contraer todo</button>
		<button class="btn-icon" on:click={openCreate}><Plus /><span>Crear plan</span></button>
	</div>
</HeaderActions>

{#if IS_DEV}
  <div class="card" style="max-width:960px; margin-bottom:.5rem; display:flex; gap:.5rem; flex-wrap:wrap; align-items:center;">
    <strong>DEV:</strong>
    <button class="btn-icon" on:click={handleSeed} disabled={isWorking}>Seed dataset</button>
    <button class="btn-icon-secondary" on:click={handleWipeMeals} disabled={isWorking}>Borrar SOLO meals</button>
    <button class="btn-icon-warning" on:click={handleNuke} disabled={isWorking}>Borrar TODO en cascada</button>
    {#if statusMsg}<span style="margin-left:.5rem; color: var(--color-muted);">{statusMsg}</span>{/if}
  </div>
{/if}

<FiltersRow
	showSearch={true}
	showFilter={false}
	showSort={true}
	{sortOptions}
	maxWidth="960px"
	on:search={(e) => (searchTerm = e.detail)}
	on:sort={(e) => (sortOption = e.detail)}
/>

<div class="scroll-area dynamic" style="--scroll-offset: 12rem; max-width: 960px;">
	{#if yearsDesc().length === 0}
		<div class="card"><p class="muted">No hay planes. Crea el primero con “Crear plan”.</p></div>
	{:else}
		{#each yearsDesc() as y}
			<div class="year-block card">
				<button
					class="row year-row"
					on:click={() => toggleYear(y)}
					aria-expanded={expandedYears.has(y)}
				>
					{#if expandedYears.has(y)}<ChevronDown size="18" />{:else}<ChevronRight size="18" />{/if}
					<span class="year-label">{y}</span>
					<span class="pill">
						{Object.values(grouped[y]).reduce((sum, arr) => sum + arr.length, 0)} semanas
					</span>
				</button>

				{#if expandedYears.has(y)}
					<div class="months">
						{#each monthsDesc(y) as m}
							<div class="month-block">
								<button
									class="row month-row"
									on:click={() => toggleMonth(y, m)}
									aria-expanded={expandedMonths.has(ymKey(y, m))}
								>
									{#if expandedMonths.has(ymKey(y, m))}<ChevronDown size="16" />{:else}<ChevronRight
											size="16"
										/>{/if}
									<span class="month-label">{monthLabel(y, m)}</span>
									<span class="pill">{grouped[y][m].length} semanas</span>
								</button>

								{#if expandedMonths.has(ymKey(y, m))}
									<CardList maxWidth="960px">
										{#each grouped[y][m] as plan (plan.id)}
											<WeeklyPlanCard
												startDate={plan.startDate}
												endDate={plan.endDate}
												onView={() => viewPlan(plan.startDate)}
												onDelete={() => removePlan(plan.id)}
											/>
										{/each}
									</CardList>
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
		gap: 0.5rem;
		padding: 0.55rem 0.65rem;
		text-align: left;
		background: transparent;
	}
	.year-block {
		margin-bottom: 0.6rem;
	}
	.months {
		padding: 0.25rem;
	}
	.month-block {
		border-top: 1px dashed var(--color-surface-700);
	}
	.pill {
		margin-left: auto;
		font-size: 0.85rem;
		color: var(--color-muted);
		background: var(--color-surface-50, #f8f9fa);
		padding: 0.1rem 0.4rem;
		border-radius: 9999px;
		border: 1px solid var(--color-surface-700);
	}
	@media (max-width: 768px) {
		.scroll-area.dynamic {
			padding-bottom: 8rem;
		}
	}
</style>
