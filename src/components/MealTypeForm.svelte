<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { mealTypeFormSchema } from '$modules/mealTypes/formSchema';
	import type { MealTypeFormData } from '$modules/mealTypes/formSchema';
	import { z } from 'zod';

	const dispatch = createEventDispatcher();

	export let initialData: MealTypeFormData = {
		name: '',
		order: 1
	};

	export let isEditMode: boolean = false;

	let form: MealTypeFormData = { ...initialData };
	let errors: Partial<Record<keyof MealTypeFormData, string>> = {};

	function handleSubmit() {
		const result = mealTypeFormSchema.safeParse(form);

		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof MealTypeFormData;
				errors[field] = issue.message;
			}
			return;
		}

		dispatch(isEditMode ? 'update' : 'create', result.data);
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	style="display: flex; flex-direction: column; gap: 1rem;"
>
	<!-- Nombre -->
	<div class="form-full">
		<label for="name">Nombre</label>
		<input
			id="name"
			name="name"
			class="input"
			bind:value={form.name}
		/>
		{#if errors.name}
			<p class="form-error">{errors.name}</p>
		{/if}
	</div>

	<!-- Orden -->
	<div class="form-row">
		<div class="form-col">
			<label for="order">Orden</label>
			<input
				id="order"
				name="order"
				class="input"
				type="number"
				min="1"
				max="5"
				bind:value={form.order}
			/>
			{#if errors.order}
				<p class="form-error">{errors.order}</p>
			{/if}
		</div>
	</div>

	<!-- Botón de guardar -->
	<div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
		<button type="submit" class="btn">
			{isEditMode ? 'Guardar cambios' : 'Crear tipo de comida'}
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

	/* Fila completa para el nombre */
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
