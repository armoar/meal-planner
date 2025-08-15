<script lang="ts">
	export let calories: number = 0;
	export let carbs: number = 0;
	export let proteins: number = 0;
	export let fat: number = 0;

	// Normaliza props si llegan como string
	$: calories = typeof calories === 'string' ? parseInt(calories) || 0 : calories;
	$: carbs = typeof carbs === 'string' ? parseInt(carbs) || 0 : carbs;
	$: proteins = typeof proteins === 'string' ? parseInt(proteins) || 0 : proteins;
	$: fat = typeof fat === 'string' ? parseInt(fat) || 0 : fat;

	let internalCalories = calories;
	let internalCarbs = carbs;
	let internalProteins = proteins;
	let internalFat = fat;

	// Sincroniza props iniciales con valores internos
	$: if (!macrosInitialized) {
		internalCalories = calories;
		internalCarbs = carbs;
		internalProteins = proteins;
		internalFat = fat;
	}

	export let onChange: (values: {
		carbs: number;
		proteins: number;
		fat: number;
		calories: number;
	}) => void;

	const KCAL_PER_GRAM = {
		carbs: 4,
		proteins: 4,
		fat: 9
	};

	let macrosInitialized = false;

	// Reparto automático 40-30-30 si todo está a 0 con 2000 kcal
	$: if (!macrosInitialized && calories === 2000 && carbs === 0 && proteins === 0 && fat === 0) {
		const newCarbs = Math.round((0.4 * calories) / KCAL_PER_GRAM.carbs);
		const newProteins = Math.round((0.3 * calories) / KCAL_PER_GRAM.proteins);
		const newFat = Math.round((0.3 * calories) / KCAL_PER_GRAM.fat);

		internalCarbs = newCarbs;
		internalProteins = newProteins;
		internalFat = newFat;

		macrosInitialized = true;

		onChange({ calories, carbs: newCarbs, proteins: newProteins, fat: newFat });
	}

	// Cálculo de kcal y % por macro
	$: carbsKcal = carbs * KCAL_PER_GRAM.carbs;
	$: proteinsKcal = proteins * KCAL_PER_GRAM.proteins;
	$: fatKcal = fat * KCAL_PER_GRAM.fat;

	$: carbsPercent = calories > 0 ? Math.round((carbsKcal * 100) / calories) : 40;
	$: proteinsPercent = calories > 0 ? Math.round((proteinsKcal * 100) / calories) : 30;
	$: fatPercent = calories > 0 ? Math.round((fatKcal * 100) / calories) : 30;

	function handleInputChange(field: 'calories' | 'carbs' | 'proteins' | 'fat', value: number) {
		const updated = {
			calories: internalCalories,
			carbs: internalCarbs,
			proteins: internalProteins,
			fat: internalFat,
			[field]: value
		};

		onChange(updated);
	}

	$: totalPercent = carbsPercent + proteinsPercent + fatPercent;

	$: percentStatus = totalPercent === 100 ? 'ok' : totalPercent > 100 ? 'over' : 'under';

	// $: percentDelta = Math.abs(100 - totalPercent); // Para calcular la diferencia
</script>

<!-- Input de calorías -->
<div class="row">
	<label for="calories">Calorías totales</label>
	<input
		id="calories"
		class="input"
		type="number"
		min="1000"
		bind:value={internalCalories}
		on:input={(e) => handleInputChange('calories', parseInt((e.target as HTMLInputElement).value))}
		style="width: 6rem;"
	/>
	<span class="unit-label">kcal</span>
</div>

<!-- Barra y inputs -->
<div class="macros-container">
	<!-- Etiquetas encima -->
	<div class="macros-bar-label">
		<div class="segment" style="width: {carbsPercent || 33.3}%">
			<span>Hidratos</span>
		</div>
		<div class="segment" style="width: {proteinsPercent || 33.3}%">
			<span>Proteínas</span>
		</div>
		<div class="segment" style="width: {fatPercent || 33.3}%">
			<span>Grasas</span>
		</div>
	</div>

	<!-- Inputs debajo -->
	<div class="input-row">
		<div class="input-wrapper macro-group" style="width: {carbsPercent || 33.3}%">
			<input
				id="carbsInput"
				type="number"
				min="0"
				bind:value={internalCarbs}
				on:input={(e) => handleInputChange('carbs', parseInt((e.target as HTMLInputElement).value))}
				class="input"
			/>
			<span class="unit-label">g</span>
		</div>
		<div class="input-wrapper macro-group" style="width: {proteinsPercent || 33.3}%">
			<input
				id="proteinsInput"
				type="number"
				min="0"
				bind:value={internalProteins}
				on:input={(e) =>
					handleInputChange('proteins', parseInt((e.target as HTMLInputElement).value))}
				class="input"
			/>
			<span class="unit-label">g</span>
		</div>
		<div class="input-wrapper macro-group" style="width: {fatPercent || 33.3}%">
			<input
				id="fatInput"
				type="number"
				min="0"
				bind:value={internalFat}
				on:input={(e) => handleInputChange('fat', parseInt((e.target as HTMLInputElement).value))}
				class="input"
			/>
			<span class="unit-label">g</span>
		</div>
	</div>

	<!-- Barra visual -->
	<div class="macros-bar">
		<div class="segment carbs" style="width: {carbsPercent || 33.3}%">
			<span>{carbsPercent}%</span>
		</div>
		<div class="segment proteins" style="width: {proteinsPercent || 33.3}%">
			<span>{proteinsPercent}%</span>
		</div>
		<div class="segment fat" style="width: {fatPercent || 33.3}%">
			<span>{fatPercent}%</span>
		</div>
	</div>

	<p class="kcal-status {percentStatus}">
		{#if percentStatus === 'ok'}
			100 %
		{:else if percentStatus === 'under'}
			{totalPercent}%
		{:else if percentStatus === 'over'}
			{totalPercent}%
		{/if}
	</p>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.macros-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.macros-bar-label {
		display: flex;
		width: 100%;
		overflow: hidden;
	}

	.macros-bar {
		display: flex;
		height: 40px;
		width: 100%;
		border-radius: var(--radius-sm);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		background-color: var(--color-error-200);
	}

	.segment {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		transition: width 0.3s ease-in-out;
		font-size: 1rem;
		font-weight: 600;
		min-width: 130px;
	}

	.segment span {
		color: var(--color-primary-950);
	}
	.carbs {
		background-color: var(--color-carbs-500);
	}
	.proteins {
		background-color: var(--color-proteins-500);
	}
	.fat {
		background-color: var(--color-fat-500);
	}

	.kcal-status {
		border-radius: var(--radius-sm);
		margin-top: 0.5rem;
		font-size: 1rem;
		text-align: center;
		padding: 0.3rem;
	}
	.kcal-status.ok {
		color: var(--color-success-500);
		background-color: var(--color-success-200);
	}
	.kcal-status.under {
		color: var(--color-error-500);
		background-color: var(--color-error-200);
	}
	.kcal-status.over {
		color: var(--color-error-500);
		background-color: var(--color-error-200);
	}

	.input-row {
		display: flex;
		justify-content: space-between;
		width: 100%;
		height: 40px;
	}

	.input-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 0.5rem;
		align-items: center;
		transition: width 0.3s ease;
		min-width: 130px; /* ✅ Añade esto */
		flex: 1 1 auto;
	}

	.input {
		width: 100%;
		max-width: 80px;
		text-align: center;
		font-size: 1rem;
		padding: 0.4rem;
		border: 1px solid #ccc;
		border-radius: var(--radius-sm);
	}
	.unit-label {
		font-size: 0.85rem;
		color: var(--color-muted);
		margin-top: 0.2rem;
	}

/* ===== Mobile only (≤768px) — vista en columnas para los inputs ===== */
@media (max-width: 768px) {
	.input-row {
		gap: 0.25rem; /* menos separación */
	}

	.input-wrapper {
		gap: 0.25rem; /* menos espacio entre input y unidad */
		min-width: 40px;
	}

	.input-wrapper .input {
		max-width: 60px; /* más estrecho */
		font-size: 1rem; /* texto más pequeño */
		padding: 0.3rem; /* menos padding */
	}

	.input-wrapper .unit-label {
		font-size: 1rem; /* más pequeña la unidad */
	}
}



</style>
