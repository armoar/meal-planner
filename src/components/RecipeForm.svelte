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
		servings: 1,
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
		// 1. Calcular los valores a guardar
		form.totalCalories = Math.round(totalMacros.calories);
		form.totalProteins = parseFloat(totalMacros.proteins.toFixed(1));
		form.totalCarbs = parseFloat(totalMacros.carbs.toFixed(1));
		form.totalFat = parseFloat(totalMacros.fat.toFixed(1));

		console.log('Servings value:', form.servings, typeof form.servings);


		// 2. Validar con Zod
		const result = recipeFormSchema.safeParse(form);

		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof RecipeFormData;
				errors[field] = issue.message;
			}
			return;
		}

		// 3. Emitir evento con los datos validados
		dispatch('submit', result.data);
	}

	function handleSelectFood(event: CustomEvent<Food>) {
		const food = event.detail;

		form.ingredients = [
			...form.ingredients,
			{
				foodId: food.id,
				quantity: 100,
				unit: defaultUnit,

				categoryIcon: food.categoryIcon,
				categoryColor: food.categoryColor
			}
		];
	}

	function getFoodName(foodId: string): string {
		return foods.find((f) => f.id === foodId)?.name ?? 'Alimento';
	}

	// Calculos de macronutrientes
	$: totalMacros = form.ingredients.reduce(
		(totals, ingredient) => {
			const food = foods.find((f) => f.id === ingredient.foodId);
			const unit = units.find((u) => u.id === ingredient.unit);
			if (!food || !unit) return totals;

			// gramos totales = cantidad × factor conversión
			const weightInGrams = ingredient.quantity * unit.conversionFactor;

			// proporción respecto a los 100g estándar
			const ratio = weightInGrams / 100;

			return {
				calories: totals.calories + food.calories * ratio,
				proteins: totals.proteins + food.proteins * ratio,
				carbs: totals.carbs + food.carbs * ratio,
				fat: totals.fat + food.fat * ratio
			};
		},
		{ calories: 0, proteins: 0, carbs: 0, fat: 0 }
	);

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
		<div class="form-col responsive-inline">
			<label for="servings">Raciones</label>
			<input
				id="servings"
				name="servings"
				class="input"
				type="number"
				placeholder="1"
				min="1"
				step="1"
				bind:value={form.servings}
				on:keydown={preventInvalidKey}
				style="max-width: 5rem;"
			/>
			{#if errors.servings}
				<p class="form-error">{errors.servings}</p>
			{/if}
		</div>
	</div>

	<div style="height: 0.8rem; border-top: 1px solid #ccc; margin-top: 1rem;"></div>

	<!-- Macronutrientes calculados automáticamente -->
	<span style="font-weight: 600; color: var(--color-primary-950);">
		Macronutrientes totales (por ración)
	</span>

	<div class="food-card__nutrients" style="margin-bottom: 1rem;">
		<div class="nutrient">
			<span class="nutrient-label">Kcal</span>
			<span class="nutrient-value">
				<span class="nutrient-total">{Math.round(totalMacros.calories)}</span>
				{#if form.servings > 0}
					<span class="nutrient-per-serving">
						({Math.round(totalMacros.calories / form.servings)})
					</span>
				{/if}
			</span>
		</div>

		<div class="nutrient">
			<span class="nutrient-label">Proteínas</span>
			<span class="nutrient-value">
				<span class="nutrient-total">{totalMacros.proteins.toFixed(1)} g</span>
				{#if form.servings > 0}
					<span class="nutrient-per-serving">
						({(totalMacros.proteins / form.servings).toFixed(1)} g)
					</span>
				{/if}
			</span>
		</div>

		<div class="nutrient">
			<span class="nutrient-label">Hidratos</span>
			<span class="nutrient-value">
				<span class="nutrient-total">{totalMacros.carbs.toFixed(1)} g</span>
				{#if form.servings > 0}
					<span class="nutrient-per-serving">
						({(totalMacros.carbs / form.servings).toFixed(1)} g)
					</span>
				{/if}
			</span>
		</div>

		<div class="nutrient">
			<span class="nutrient-label">Grasas</span>
			<span class="nutrient-value">
				<span class="nutrient-total">{totalMacros.fat.toFixed(1)} g</span>
				{#if form.servings > 0}
					<span class="nutrient-per-serving">
						({(totalMacros.fat / form.servings).toFixed(1)} g)
					</span>
				{/if}
			</span>
		</div>
	</div>

	<!-- Ingredientes -->
	<div class="ingredient-list">
		<div class="ingredient-list-header">
			<span style="font-weight: 600; color: var(--color-primary-950);">Ingredientes</span>
			<!-- Botón para abrir modal -->
			<button
				type="button"
				class="btn-icon"
				on:click={() => (showFoodSelector = true)}
				style="margin-top: 0.75rem;"
			>
				<Plus />
				<span>Añadir ingrediente</span>
			</button>
		</div>
		<div class="ingredient-list-content">
			<!-- Lista de ingredientes ya añadidos -->
			{#each form.ingredients as ingredient, index}
				<FoodPill
					{ingredient}
					{units}
					foodName={getFoodName(ingredient.foodId)}
					on:change={(e) => (form.ingredients[index] = e.detail)}
					on:remove={() => {
						console.log('Eliminando ingrediente en posición', index);
						form.ingredients = form.ingredients.filter((_, i) => i !== index);
					}}
				/>
			{/each}
		</div>
	</div>
	{#if errors.ingredients}
		<p class="form-error" style="margin-top: 0.5rem;">{errors.ingredients}</p>
	{/if}

	<!-- Modal de selección -->
	<FoodSelectorModal
		bind:open={showFoodSelector}
		{foods}
		{categories}
		on:select={handleSelectFood}
	/>

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
		gap: 0.3rem;
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

	.food-card__nutrients {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		min-width: 200px;
		border: 1px solid var(--color-surface-700);
		border-radius: var(--radius-md);
		padding: 0.5rem 1.5rem;
	}

	.nutrient {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	.nutrient-label {
		margin-bottom: 0.25rem;
	}

	.nutrient-value {
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-text);
		display: flex;
		flex-direction: row;
		gap: 0.4rem;
	}

	.nutrient-total {
		font-weight: 700;
	}

	.nutrient-per-serving {
		font-weight: 400;
	}

	.ingredient-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.ingredient-list-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.ingredient-list-content {
		background-color: var(--color-surface-500);
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		border-radius: var(--radius-md);
		padding: 0.5rem;
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

		.nutrient-value {
			flex-wrap: wrap;
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 0rem;
		}
	}
</style>
