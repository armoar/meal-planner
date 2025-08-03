<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { dinerFormSchema } from '$modules/diners/formSchema';
	import type { DinerFormData } from '$modules/diners/formSchema';
	import { z } from 'zod';

	const dispatch = createEventDispatcher();

	export let initialData: DinerFormData = {
		name: '',
		caloriesObjective: '' as unknown as number,
		proteinsObjective: '' as unknown as number,
		carbsObjective: '' as unknown as number,
		fatObjective: '' as unknown as number,
		allergies: {
			foods: [],
			categories: []
		}
	};

	export let isEditMode: boolean = false;

	let form: DinerFormData = { ...initialData };
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

	function preventInvalidKey(e: KeyboardEvent) {
		const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
		const isDigit = /^[0-9]$/.test(e.key);
		if (!isDigit && !allowed.includes(e.key)) {
			e.preventDefault();
		}
	}

	type NumericField = 'caloriesObjective' | 'proteinsObjective' | 'carbsObjective' | 'fatObjective';

	function validateIntegerInput(field: NumericField, event: Event) {
		const inputEl = event.target as HTMLInputElement;
		const value = inputEl.value;
		const isValid = /^\d*$/.test(value);

		if (isValid || value === '') {
			form[field] = value === '' ? ('' as unknown as number) : parseInt(value, 10) as DinerFormData[typeof field];
			errors[field] = '';
		} else {
			errors[field] = 'Solo se permiten números enteros';
		}
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	style="display: flex; flex-direction: column; gap: 1rem;"
>
	<!-- Nombre -->
	<div class="form-full">
		<label for="name">Nombre del comensal</label>
		<input id="name" name="name" class="input" bind:value={form.name} placeholder="P. ej. Arturo" />
		{#if errors.name}
			<p class="form-error">{errors.name}</p>
		{/if}
	</div>

	<!-- Objetivos nutricionales -->
	<div class="form-row">
		<div class="form-col responsive-inline">
			<label for="calories">Calorías</label>
			<div class="input-with-unit">
				<input
					id="calories"
					name="calories"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.caloriesObjective}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('caloriesObjective', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">kcal</span>
			</div>
			{#if errors.caloriesObjective}
				<p class="form-error">{errors.caloriesObjective}</p>
			{/if}
		</div>
		<div class="form-col responsive-inline">
			<label for="proteins">Proteínas</label>
			<div class="input-with-unit">
				<input
					id="proteins"
					name="proteins"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.proteinsObjective}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('proteinsObjective', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.proteinsObjective}
				<p class="form-error">{errors.proteinsObjective}</p>
			{/if}
		</div>
		<div class="form-col responsive-inline">
			<label for="carbs">Hidratos</label>
			<div class="input-with-unit">
				<input
					id="carbs"
					name="carbs"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.carbsObjective}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('carbsObjective', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.carbsObjective}
				<p class="form-error">{errors.carbsObjective}</p>
			{/if}
		</div>
		<div class="form-col responsive-inline">
			<label for="fat">Grasas</label>
			<div class="input-with-unit">
				<input
					id="fat"
					name="fat"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.fatObjective}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('fatObjective', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.fatObjective}
				<p class="form-error">{errors.fatObjective}</p>
			{/if}
		</div>
	</div>

	<!-- Botón de guardar -->
	<div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
		<button type="submit" class="btn">
			{isEditMode ? 'Guardar cambios' : 'Crear'}
		</button>
	</div>
</form>

<style>
	/* Igual al estilo de FoodForm */
	.form-row {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
	}

	.form-col {
		flex: 0 0 auto;
		width: 10%;
	}

	.responsive-inline {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.form-full {
		width: 100%;
	}

	.input {
		width: 100%;
		max-width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
	}

	.input-with-unit {
		display: flex;
		align-items: center;
	}

	.input-with-unit .input {
		flex: 1;
		padding-right: 0.5rem;
	}

	.unit-label {
		margin-left: 0.4rem;
		color: var(--color-muted);
		font-size: 0.9rem;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.responsive-inline {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		.responsive-inline label {
			width: 40%;
			min-width: 90px;
			margin-bottom: 0;
		}

		.input-with-unit {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.input-with-unit .input {
			flex: 1;
			min-width: 0;
			margin-left: 2rem;
		}

		.form-row {
			flex-direction: column;
		}

		.form-col {
			max-width: 100%;
			width: 100%;
		}

		.form-full {
			max-width: 100%;
		}
	}
</style>
