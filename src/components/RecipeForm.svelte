<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { recipeFormSchema } from '$modules/recipes/formSchema';
	import type { RecipeFormData } from '$modules/recipes/formSchema';

	import { z } from 'zod';
	import FoodPill from './FoodPill.svelte';
	import FoodSelectorModal from './FoodSelectorModal.svelte';
	import { Plus } from 'lucide-svelte';
	import type { Food } from '$modules/foods/types';
	import type { Category } from '$modules/categories/types';
	import type { Unit } from '$modules/units/types';

	const dispatch = createEventDispatcher();

	export let foods: Food[] = [];
	export let categories: Category[] = [];
	export let units: Unit[] = [];

	export let initialData: RecipeFormData = {
		name: '',
		servings: '' as unknown as number,
		ingredients: [],
		totalCalories: '' as unknown as number,
		totalProteins: '' as unknown as number,
		totalCarbs: '' as unknown as number,
		totalFat: '' as unknown as number
	};

	export let isEditMode: boolean = false;
	let showFoodSelector = false;

	let form: RecipeFormData = { ...initialData };
	let errors: Partial<Record<keyof RecipeFormData, string>> = {};



	const defaultUnit = units.find((u) => u.symbol === 'g')?.id ?? units[0]?.id ?? '';

	function handleSubmit() {
		const result = recipeFormSchema.safeParse(form);

		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof RecipeFormData;
				errors[field] = issue.message;
			}
			return;
		}

		dispatch('submit', result.data);
	}

	function handleSelectFood(event: CustomEvent<Food>) {
		const food = event.detail;

		form.ingredients.push({
			foodId: food.id,
			quantity: 100,
			unit: defaultUnit
		});
	}

	function preventInvalidKey(e: KeyboardEvent) {
		const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
		const isDigit = /^[0-9]$/.test(e.key);

		if (!isDigit && !allowed.includes(e.key)) {
			e.preventDefault();
		}
	}

	type NumericField = 'servings' | 'totalCalories' | 'totalProteins' | 'totalCarbs' | 'totalFat';

	function validateIntegerInput(field: NumericField, event: Event) {
		const inputEl = event.target as HTMLInputElement;
		const value = inputEl.value;

		const isValid = /^\d*$/.test(value);

		if (isValid || value === '') {
			form[field] =
				value === ''
					? ('' as unknown as number)
					: (parseInt(value, 10) as RecipeFormData[typeof field]);
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
			<label for="name">Nombre de la receta</label>
			<input
				id="name"
				name="name"
				class="input"
				bind:value={form.name}
				placeholder="P. ej. Lentejas estofadas"
			/>
			{#if errors.name}
				<p class="form-error">{errors.name}</p>
			{/if}
		</div>

		<!-- Porciones -->
		<div class="form-full">
			<label for="servings">Raciones</label>
			<input
				id="servings"
				name="servings"
				class="input"
				type="number"
				placeholder="1"
				min="1"
				step="any"
				value={form.servings}
				on:keydown={preventInvalidKey}
				on:input={(e) => validateIntegerInput('servings', e)}
				style="max-width: 5.5rem;"
			/>
			{#if errors.servings}
				<p class="form-error">{errors.servings}</p>
			{/if}
		</div>
	</div>

	<div style="height: 0.8rem; border-top: 1px solid #ccc; margin-top: 1rem;"></div>

	<!-- Ingredientes -->
	<div>
		<span style="font-weight: 600;">Ingredientes</span>

		<!-- Lista de ingredientes ya añadidos -->
		{#each form.ingredients as ingredient, index}
			<FoodPill
				{ingredient}
				{units}
				on:change={(e) => (form.ingredients[index] = e.detail)}
				on:remove={() => form.ingredients.splice(index, 1)}
			/>
		{/each}

		<!-- Botón para abrir modal -->
		<button
			type="button"
			class="btn-icon"
			on:click={() => (showFoodSelector = true)}
			style="margin-top: 0.75rem;"
		>
			<Plus /> Añadir alimento
		</button>
	</div>

	<!-- Modal de selección -->
	<FoodSelectorModal
		bind:open={showFoodSelector}
		{foods}
		{categories}
		on:select={handleSelectFood}
	/>

	<!-- Macronutrientes -->
	<div class="form-row">
		<div class="form-col responsive-inline">
			<label for="totalCalories">Calorías</label>
			<div class="input-with-unit">
				<input
					id="totalCalories"
					name="totalCalories"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.totalCalories}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('totalCalories', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">kcal</span>
			</div>
			{#if errors.totalCalories}
				<p class="form-error">{errors.totalCalories}</p>
			{/if}
		</div>
		<div class="form-col responsive-inline">
			<label for="totalProteins">Proteínas</label>
			<div class="input-with-unit">
				<input
					id="totalProteins"
					name="totalProteins"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.totalProteins}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('totalProteins', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.totalProteins}
				<p class="form-error">{errors.totalProteins}</p>
			{/if}
		</div>
		<div class="form-col responsive-inline">
			<label for="totalCarbs">Hidratos</label>
			<div class="input-with-unit">
				<input
					id="totalCarbs"
					name="totalCarbs"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.totalCarbs}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('totalCarbs', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.totalCarbs}
				<p class="form-error">{errors.totalCarbs}</p>
			{/if}
		</div>
		<div class="form-col responsive-inline">
			<label for="totalFat">Grasas</label>
			<div class="input-with-unit">
				<input
					id="totalFat"
					name="totalFat"
					class="input"
					type="number"
					placeholder="0"
					min="0"
					step="any"
					value={form.totalFat}
					on:keydown={preventInvalidKey}
					on:input={(e) => validateIntegerInput('totalFat', e)}
					style="max-width: 5.5rem;"
				/>
				<span class="unit-label">g</span>
			</div>
			{#if errors.totalFat}
				<p class="form-error">{errors.totalFat}</p>
			{/if}
		</div>
	</div>

	<!-- Botón de guardar -->
	<div style="display: flex; justify-content: space-between; margin-top: 1rem;">
		<span style="color: var(--color-muted);">Totales para toda la receta</span>
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
