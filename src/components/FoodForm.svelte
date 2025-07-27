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
		calories: 0,
		proteins: 0,
		carbs: 0,
		fat: 0
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
</script>

<form
	on:submit|preventDefault={handleSubmit}
	style="display: flex; flex-direction: column; gap: 1rem;"
>
	<!-- Nombre -->
	<div class="form-full">
		<label for="name">Nombre del alimento</label>
		<input id="name" name="name" class="input" bind:value={form.name} />
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
		class="input"
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
		<option value="" disabled selected>Selecciona una categoría</option>
		{#each categories as c}
			<option value={c.id}>
				{c.icon} {c.name}
			</option>
		{/each}
	</select>
	{#if errors.categoryId}
		<p class="form-error">{errors.categoryId}</p>
	{/if}
</div>

	<!-- Macronutrientes -->
	<div class="form-row">
		<div class="form-col">
			<label for="calories">Calorías (kcal)</label>
			<input id="calories" name="calories" class="input" type="number" min="0" step="any" bind:value={form.calories} />
			{#if errors.calories}
				<p class="form-error">{errors.calories}</p>
			{/if}
		</div>
		<div class="form-col">
			<label for="proteins">Proteína (g)</label>
			<input id="proteins" name="proteins" class="input" type="number" min="0" step="any" bind:value={form.proteins} />
			{#if errors.proteins}
				<p class="form-error">{errors.proteins}</p>
			{/if}
		</div>
		<div class="form-col">
			<label for="carbs">Carbohidratos (g)</label>
			<input id="carbs" name="carbs" class="input" type="number" min="0" step="any" bind:value={form.carbs} />
			{#if errors.carbs}
				<p class="form-error">{errors.carbs}</p>
			{/if}
		</div>
		<div class="form-col">
			<label for="fat">Grasa (g)</label>
			<input id="fat" name="fat" class="input" type="number" min="0" step="any" bind:value={form.fat} />
			{#if errors.fat}
				<p class="form-error">{errors.fat}</p>
			{/if}
		</div>
	</div>

	<!-- Botón de guardar -->
	<div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
		<button type="submit" class="btn">
			{isEditMode ? 'Guardar cambios' : 'Crear alimento'}
		</button>
	</div>
</form>

<style>
	.form-row {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.form-col {
		flex: 1;
		min-width: 120px;
		max-width: 300px;
	}

	.form-full {
		width: 100%;
		max-width: 600px;
	}

	.input {
		width: 100%;
		max-width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		.form-row {
			flex-direction: column;
		}

		.form-col {
			max-width: 100%;
		}

		.form-full {
			max-width: 100%;
		}
	}
</style>
