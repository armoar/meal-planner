<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { unitFormSchema } from '$modules/units/formSchema';
	import type { UnitFormData } from '$modules/units/formSchema';
	import { z } from 'zod';

	const dispatch = createEventDispatcher();

	// Props opcionales para modo edición
	export let initialData: UnitFormData = {
		name: '',
		symbol: '',
		conversionFactor: 1
	};

	export let isEditMode: boolean = false;

	let form: UnitFormData = { ...initialData };
	let errors: Partial<Record<keyof UnitFormData, string>> = {};

	function handleSubmit() {
		const result = unitFormSchema.safeParse(form);

		if (!result.success) {
			errors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof UnitFormData;
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

<!-- Símbolo y factor -->
<div class="form-row">
  <div class="form-col">
    <label for="symbol">Símbolo</label>
    <input
      id="symbol"
      name="symbol"
      class="input"
      bind:value={form.symbol}
    />
    {#if errors.symbol}
      <p class="form-error">{errors.symbol}</p>
    {/if}
  </div>

  <div class="form-col">
    <label for="conversionFactor">Factor de conversión</label>
    <input
      id="conversionFactor"
      name="conversionFactor"
      class="input"
      type="number"
      min="0"
      step="any"
      bind:value={form.conversionFactor}
    />
    {#if errors.conversionFactor}
      <p class="form-error">{errors.conversionFactor}</p>
    {/if}
  </div>
</div>

	<!-- Botón de guardar -->
	<div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
		<button type="submit" class="btn">
			{isEditMode ? 'Guardar cambios' : 'Crear unidad'}
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

