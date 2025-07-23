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
  
  <form on:submit|preventDefault={handleSubmit} style="display: flex; flex-direction: column; gap: 1rem;">
    <!-- Nombre -->
    <div>
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
  
    <!-- Símbolo -->
    <div>
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
  
    <!-- Factor de conversión -->
    <div>
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
  
    <!-- Botón de guardar -->
    <div style="display: flex; justify-content: flex-end;">
      <button type="submit" class="btn">
        Guardar unidad
      </button>
    </div>
  </form>
  