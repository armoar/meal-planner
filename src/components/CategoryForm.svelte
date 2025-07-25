<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { categoryFormSchema } from '$modules/categories/formSchema';
	import type { CategoryFormData } from '$modules/categories/formSchema';
	import { z } from 'zod';
	import { Palette } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Props opcionales para modo edición
	export let initialData: CategoryFormData = {
		name: '',
		icon: '',
		color: '#949494'
	};

	export let isEditMode: boolean = false;

	let form: CategoryFormData = { ...initialData };
	let errors: Partial<Record<keyof CategoryFormData, string>> = {};

	function handleSubmit() {
		const result = categoryFormSchema.safeParse(form);

		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof CategoryFormData;
				errors[field] = issue.message;
			}
			return;
		}

		dispatch('submit', result.data);
	}

	let colorInputRef: HTMLInputElement;

	function openColorPicker() {
		colorInputRef?.click();
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	style="display: flex; flex-direction: column; gap: 1rem;"
>
	<div class="form-full">
		<label for="name">Nombre</label>
		<input id="name" class="input" type="text" bind:value={form.name} />
		{#if errors.name}
			<div class="form-error">{errors.name}</div>
		{/if}
	</div>

	<div class="form-row">
		<div class="form-col">
			<label for="icon">Icono</label>
			<input id="icon" class="input" type="text" bind:value={form.icon} />
			{#if errors.icon}
				<div class="form-error">{errors.icon}</div>
			{/if}
		</div>

		<div class="form-col">
			<label for="color">Color</label>
			<div style="display: flex; align-items: center;gap: 0;">
				<input
					id="color"
					bind:this={colorInputRef}
					type="color"
					bind:value={form.color}
					style="opacity: 0; position: absolute; pointer-events: none;"
				/>

				<button
					type="button"
					on:click={openColorPicker}
					style="
		width: 100%;
		height: 2.4rem;
		border-radius: var(--radius-md);
		background-color: {form.color};
		border: 1px solid var(--color-surface-700);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		padding: 0;
		margin-right: 0.2rem;
	"
					aria-label="Elegir color"
				></button>

				<div
					style="
                    background-color: var(--color-surface-700);
                    color: var(--color-surface-950);
                    border: 1px var(--color-surface-950);
                    padding: 0.6rem;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                "
				>
					<Palette size="18" stroke-width="2" />
				</div>
			</div>
		</div>
	</div>

	<!-- Botón de guardar -->
	<div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
		<button type="submit" class="btn">
			{isEditMode ? 'Guardar cambios' : 'Crear categoría'}
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
