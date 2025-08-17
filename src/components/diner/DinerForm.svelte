<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { dinerFormSchema } from '$modules/diners/formSchema';
	import type { DinerFormData } from '$modules/diners/formSchema';
	import DonutChart from '$components/DonutChart.svelte';

	const dispatch = createEventDispatcher();

	export let initialData: DinerFormData = {
		name: '',
		caloriesObjective: '' as unknown as number,
		proteinsObjective: '' as unknown as number,
		carbsObjective: '' as unknown as number,
		fatObjective: '' as unknown as number,
		allergies: { foods: [], categories: [] }
	};

	export let isEditMode: boolean = false;

	let form: DinerFormData = {
		...initialData,
		caloriesObjective:
			initialData.caloriesObjective && initialData.caloriesObjective > 0
				? initialData.caloriesObjective
				: 2000,
		carbsObjective: initialData.carbsObjective ?? 0,
		proteinsObjective: initialData.proteinsObjective ?? 0,
		fatObjective: initialData.fatObjective ?? 0
	};

	let errors: Partial<Record<keyof DinerFormData, string>> = {};

	function handleSubmit() {
		const result = dinerFormSchema.safeParse(form);
		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof DinerFormData;
				errors[field] = issue.message;
			}
			return;
		}
		dispatch('submit', result.data);
	}

	let activePreset: '50-30-20' | '40-30-30' | '45-20-35' | null = null;

	function applyPreset(p: { carbsPct: number; proteinsPct: number; fatPct: number }) {
		const kcal = Number(form.caloriesObjective) || 0;
		if (kcal <= 0) return;

		form.carbsObjective = Math.round(((p.carbsPct / 100) * kcal) / 4); // 4 kcal/g
		form.proteinsObjective = Math.round(((p.proteinsPct / 100) * kcal) / 4); // 4 kcal/g
		form.fatObjective = Math.round(((p.fatPct / 100) * kcal) / 9); // 9 kcal/g
	}

	const tolerancePct = 1; // rango de tolerancia (ajústalo a tu gusto)

	$: kcalFromMacros =
		(Number(form.carbsObjective) || 0) * 4 +
		(Number(form.proteinsObjective) || 0) * 4 +
		(Number(form.fatObjective) || 0) * 9;

	$: diffKcal = Math.round(kcalFromMacros - (Number(form.caloriesObjective) || 0));

	$: totalKcal = Number(form.caloriesObjective) || 0;

	$: carbsPct = totalKcal
		? Math.round((((Number(form.carbsObjective) || 0) * 4) / totalKcal) * 100)
		: 0;
	$: proteinsPct = totalKcal
		? Math.round((((Number(form.proteinsObjective) || 0) * 4) / totalKcal) * 100)
		: 0;
	$: fatPct = totalKcal
		? Math.round((((Number(form.fatObjective) || 0) * 9) / totalKcal) * 100)
		: 0;

	$: sumPct = (kcalFromMacros / (Number(form.caloriesObjective) || 1)) * 100;
	$: diffPct = sumPct - 100; // + = te pasas, - = te faltan
	$: diffPctInt = Math.round(diffPct);

	$: statusText =
		Math.abs(diffPctInt) >= tolerancePct
			? diffPctInt > 0
				? `Sobra: ${Math.abs(diffPctInt)}% (${Math.abs(diffKcal)} kcal)`
				: `Por distribuir: ${Math.abs(diffPctInt)}% (${Math.abs(diffKcal)} kcal)`
			: '';

	$: showStatus = statusText !== '';
</script>

<form on:submit|preventDefault={handleSubmit} class="form-root">
	<!-- Nombre -->
	<div class="form-full">
		<label for="name">Nombre del comensal</label>
		<input id="name" name="name" class="input" bind:value={form.name} placeholder="P. ej. Arturo" />
		{#if errors.name}<p class="form-error">{errors.name}</p>{/if}
	</div>

	<div class="divider"></div>

	<span class="section-title">Objetivos de macronutrientes</span>

	<!-- Calorías -->
	<div class="macros-header">
		<div class="calories-row">
			<label for="calories">Calorías</label>
			<div class="calories-input">
				<input
					id="calories"
					name="calories"
					class="input"
					type="number"
					min="0"
					inputmode="numeric"
					bind:value={form.caloriesObjective}
					placeholder="Ej. 2000"
				/>
				<span class="unit">kcal</span>
			</div>
			{#if errors.caloriesObjective}<p class="form-error">{errors.caloriesObjective}</p>{/if}
		</div>
		
		<div class="preset-chips">
			<button
				type="button"
				class="chip"
				on:click={() => {
					applyPreset({ carbsPct: 50, proteinsPct: 30, fatPct: 20 });
				}}
				title="Balanceado (AMDR)">50-30-20</button
			>

			<button
				type="button"
				class="chip"
				on:click={() => {
					applyPreset({ carbsPct: 40, proteinsPct: 30, fatPct: 30 });
				}}
				title="Zone">40-30-30</button
			>

			<button
				type="button"
				class="chip"
				on:click={() => {
					applyPreset({ carbsPct: 45, proteinsPct: 20, fatPct: 35 });
				}}
				title="Mediterránea">45-20-35</button
			>
		</div>
	</div>

	<!-- Grid: izquierda Donut, derecha inputs -->
	<div class="macros-grid">
		<!-- Donut -->
		<div class="donut-box">
			<DonutChart
				carbs={form.carbsObjective}
				proteins={form.proteinsObjective}
				fat={form.fatObjective}
				totalCalories={form.caloriesObjective}
				{tolerancePct}
			/>

			<div class="macro-balance-slot">
				<span
					class="macro-balance-hint"
					class:is-hidden={!showStatus}
					data-state={diffKcal > 0 ? 'over' : 'under'}
					aria-live="polite"
					aria-hidden={!showStatus}
				>
					{statusText}
				</span>
			</div>
		</div>

		<!-- Inputs macros -->
		<div class="macros-inputs">
			<div class="macro-row">
				<label for="carbs"
					>Hidratos {#if totalKcal}
						({carbsPct}%)
					{/if}</label
				>
				<div class="macro-input carbs">
					<input
						id="carbs"
						name="carbs"
						class="input"
						type="number"
						min="0"
						step="any"
						inputmode="decimal"
						bind:value={form.carbsObjective}
						placeholder="0"
					/>
					<span class="unit">g</span>
				</div>
				{#if errors.carbsObjective}<p class="form-error">{errors.carbsObjective}</p>{/if}
			</div>

			<div class="macro-row">
				<label for="proteins"
					>Proteínas {#if totalKcal}
						({proteinsPct}%)
					{/if}</label
				>
				<div class="macro-input proteins">
					<input
						id="proteins"
						name="proteins"
						class="input"
						type="number"
						min="0"
						step="any"
						inputmode="decimal"
						bind:value={form.proteinsObjective}
						placeholder="0"
					/>
					<span class="unit">g</span>
				</div>
				{#if errors.proteinsObjective}<p class="form-error">{errors.proteinsObjective}</p>{/if}
			</div>

			<div class="macro-row">
				<label for="fat"
					>Grasas {#if totalKcal}
						({fatPct}%)
					{/if}</label
				>
				<div class="macro-input fat">
					<input
						id="fat"
						name="fat"
						class="input"
						type="number"
						min="0"
						step="any"
						inputmode="decimal"
						bind:value={form.fatObjective}
						placeholder="0"
					/>
					<span class="unit">g</span>
				</div>
				{#if errors.fatObjective}<p class="form-error">{errors.fatObjective}</p>{/if}
			</div>
		</div>
	</div>

	<div class="actions">
		<button type="submit" class="btn">{isEditMode ? 'Guardar cambios' : 'Crear'}</button>
	</div>
</form>

<style>
	.form-root {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.form-full {
		width: 100%;
	}
	.section-title {
		font-weight: 600;
		font-size: 1.15rem;
		color: var(--color-primary-950);
	}
	.input {
		width: 100%;
		max-width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
	}
	.divider {
		height: 0.8rem;
		border-top: 1px solid #ccc;
		margin-top: 1rem;
	}

	.macros-header {
		display: grid;
		grid-template-columns: 1fr auto; /* izquierda: input kcal | derecha: chips */
		gap: 0.75rem 1rem;
		align-items: end;
		margin-bottom: 1rem;
	}

	.calories-row {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		max-width: 320px;
	}
	.calories-input {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
		align-items: center;
	}
	.preset-chips {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	.chip {
		padding: 0.5rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--color-surface-700);
		background: var(--color-surface-500);
		font-size: 0.85rem;
		line-height: 1;
		cursor: pointer;
	}
	.chip:hover {
		filter: brightness(0.98);
	}

	.unit {
		color: var(--color-muted);
		font-size: 0.95rem;
	}

	.macros-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1rem;
		align-items: start;
	}
	.donut-box {
		width: 100%;
		max-width: 380px;
	}
	.macros-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.macro-row {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.macro-input {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
		align-items: center;
		max-width: 110px;
	}

	/* Macro specific styles */
	.macro-row label[for='carbs'],
	.macro-input.carbs input {
		border-color: var(--color-carbs-500);
	}

	.macro-row label[for='carbs'] {
		color: var(--color-carbs-500);
	}

	.macro-row label[for='proteins'],
	.macro-input.proteins input {
		border-color: var(--color-proteins-500);
	}

	.macro-row label[for='proteins'] {
		color: var(--color-proteins-500);
	}

	.macro-row label[for='fat'],
	.macro-input.fat input {
		border-color: var(--color-fat-500);
	}

	.macro-row label[for='fat'] {
		color: var(--color-fat-500);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.macro-balance-slot {
		height: 1.5rem; /* reserva exactamente 1 línea */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.macro-balance-hint {
		display: flex;
		white-space: nowrap; /* evita que ocupe 2 líneas */
		transition: opacity 160ms ease;
	}

	.macro-balance-hint.is-hidden {
		opacity: 0;
		visibility: hidden; /* mantiene el hueco sin interacción */
	}

	/* Colores que ya tenías */
	.macro-balance-hint[data-state='over'] {
		color: var(--color-error-500);
	}
	.macro-balance-hint[data-state='under'] {
		color: var(--color-error-500);
	}

	@media (max-width: 820px) {
		.macros-grid {
			grid-template-columns: 1fr;
		}
		.donut-box {
			max-width: 100%;
		}
		.input {
			font-size: 0.95rem;
			padding: 0.45rem 0.6rem;
		}

		.calories-input {
			grid-template-columns: 1fr auto;
		}

		.macros-header {
			grid-template-columns: 1fr; /* una columna */
			gap:2rem;
		}

		/* input + kcal */
		.preset-chips {
			gap: 0.5rem;
			grid-column: 1 / -1;
			justify-content: center;
		}
	}
</style>
