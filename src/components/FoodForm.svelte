<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { foodFormSchema } from '$modules/foods/formSchema';
	import type { FoodFormData } from '$modules/foods/formSchema';
	import { z } from 'zod';

	const dispatch = createEventDispatcher();

	export let initialData: FoodFormData = {
		name: '',
		categoryId: '',
		categoryName: '',
		categoryIcon: '',
		categoryColor: '',
		calories: '' as unknown as number,
		proteins: '' as unknown as number,
		carbs: '' as unknown as number,
		fat: '' as unknown as number
	};

	interface Category {
		id: string;
		name: string;
		icon: string;
		color: string;
	}

	export let categories: Category[] = [];

	export let isEditMode: boolean = false;

	let form: FoodFormData = { ...initialData };
	let errors: Partial<Record<keyof FoodFormData, string>> = {};

	function handleSubmit() {
		const result = foodFormSchema.safeParse(form);

		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof FoodFormData;
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

	type NumericField = 'calories' | 'proteins' | 'carbs' | 'fat';

	function validateIntegerInput(field: NumericField, event: Event) {
	const inputEl = event.target as HTMLInputElement;
	const value = inputEl.value;

	// Solo permitir dígitos
	const isValid = /^\d*$/.test(value);

	if (isValid || value === '') {
		form[field] = value === '' ? ('' as unknown as number) : parseInt(value, 10) as FoodFormData[typeof field];
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
	<div class="form-row">
		<!-- Nombre -->
		<div class="form-full">
			<label for="name">Nombre del alimento</label>
			<input id="name" name="name" class="input" bind:value={form.name} placeholder="P. ej. Pechuga de pollo"/>
			{#if errors.name}
				<p class="form-error">{errors.name}</p>
			{/if}
		</div>

		<!-- Categoría -->
		<!-- Selector de categoría -->
		<div class="form-full">
			<label for="categoryId">Categoría</label>
			<select
				id="categoryId"
				class="select"
				required
				bind:value={form.categoryId}
				on:change={(e) => {
					const selectEl = e.target as HTMLSelectElement;
					const selected = categories.find((c) => c.id === selectEl.value);

					if (selected) {
						form.categoryId = selected.id;
						form.categoryName = selected.name;
						form.categoryIcon = selected.icon;
						form.categoryColor = selected.color;
					}
				}}
			>
				<option value="" disabled selected hidden>Selecciona una categoría...</option>
				{#each categories as c}
					<option value={c.id}>
						{c.icon}
						{c.name}
					</option>
				{/each}
			</select>
			{#if errors.categoryId}
				<p class="form-error">{errors.categoryId}</p>
			{/if}
		</div>
	</div>

	<div style="height: 0.8rem; border-top: 1px solid #ccc; margin-top: 1rem;"></div>

	<!-- Macronutrientes -->
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
					value={form.calories}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('calories', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">kcal</span>
			</div>
			{#if errors.calories}
				<p class="form-error">{errors.calories}</p>
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
					value={form.proteins}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('proteins', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.proteins}
				<p class="form-error">{errors.proteins}</p>
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
					value={form.carbs}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('carbs', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.carbs}
				<p class="form-error">{errors.carbs}</p>
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
					value={form.fat}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('fat', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.fat}
				<p class="form-error">{errors.fat}</p>
			{/if}
		</div>
	</div>

	<!-- Botón de guardar -->

	<div style="display: flex; justify-content: space-between; margin-top: 1rem;">
		<span style="color: var(--color-muted);">Para 100g o 100ml</span>
		<button type="submit" class="btn">
			{isEditMode ? 'Guardar cambios' : 'Crear'}
		</button>
	</div>
</form>

<style>
	.form-row {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
	}

	.form-col {
		flex: 0 0 auto;
		width: 10%;
	}
	/* En escritorio: se comporta igual que antes */
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
