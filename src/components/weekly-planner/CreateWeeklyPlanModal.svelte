<script lang="ts">
    import Modal from '$components/Modal.svelte';
    import { createEventDispatcher } from 'svelte';
    import { createWeeklyPlan } from '$modules/weeklyPlans/api';
    import type { Diner } from '$modules/diners/types';
  
    /** Control externo de visibilidad */
    export let open = false;
    /** Ancho máximo del modal */
    export let maxWidth: string = '680px';
    /** Comensales disponibles */
    export let diners: Diner[] = [];
    /** (Opcional) fecha inicial sugerida 'YYYY-MM-DD' */
    export let defaultStart: string | null = null;
  
    const dispatch = createEventDispatcher();
  
    // --- State ---
    let startDate = defaultStart ?? nextMondayUTC();
    let selectedIds: string[] = [];
    let isSubmitting = false;
    let errorMsg = '';
  
    $: allChecked = selectedIds.length === diners.length && diners.length > 0;
  
    function handleClose() {
      if (!isSubmitting) dispatch('close');
    }
  
    function toggleAll() {
      selectedIds = allChecked ? [] : diners.map((d) => d.id);
    }
  
    // --- Helpers fecha (UTC, consistente con la app) ---
    function formatDateUTC(d: Date) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const da = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    }
    function nextMondayUTC(): string {
      const now = new Date();
      const day = now.getUTCDay(); // 0=dom..6=sáb
      const diff = now.getUTCDate() - day + (day === 0 ? 1 : 8 - day); // siguiente lunes
      const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
      return formatDateUTC(monday);
    }
    function isMonday(ymd: string): boolean {
      const [y, m, d] = ymd.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      const dow = dt.getUTCDay(); // 1=lunes
      return dow === 1;
    }
  
    async function onSubmit(e: Event) {
      e.preventDefault();
      errorMsg = '';
  
      if (!startDate) {
        errorMsg = 'Selecciona una fecha de inicio.';
        return;
      }
      if (!isMonday(startDate)) {
        errorMsg = 'La fecha de inicio debe ser lunes.';
        return;
      }
  
      try {
        isSubmitting = true;
        const { id } = await createWeeklyPlan(startDate, selectedIds);
        dispatch('created', { id, start: startDate });
      } catch (err: any) {
        console.error(err);
        errorMsg = err?.message ?? 'No se pudo crear el plan.';
      } finally {
        isSubmitting = false;
      }
    }
  
    // Si se cierra desde fuera, resetea errores para la próxima apertura
    $: if (!open) {
      errorMsg = '';
    }
  </script>
  
  {#if open}
    <Modal title="Crear plan semanal" onClose={handleClose} {maxWidth}>
      <form on:submit={onSubmit} class="modal__body">
        <div class="form-group">
          <label>Fecha de inicio (lunes)</label>
          <input class="input" type="date" bind:value={startDate} required />
          <div class="form-hint">Debe ser lunes. El plan cubrirá de lunes a domingo.</div>
        </div>
  
        <div class="form-group">
          <div class="form-row" style="justify-content: space-between; align-items:center;">
            <label>Comensales incluidos</label>
            <button type="button" class="btn-text" on:click={toggleAll}>
              {allChecked ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
          </div>
  
          {#if diners.length === 0}
            <div class="muted">No hay comensales disponibles.</div>
          {:else}
            <div class="checkbox-grid">
              {#each diners as d}
                <label class="checkbox-item">
                  <input type="checkbox" bind:group={selectedIds} value={d.id} />
                  <span>{d.name}</span>
                </label>
              {/each}
            </div>
          {/if}
        </div>
  
        {#if errorMsg}
          <div class="alert error">{errorMsg}</div>
        {/if}
  
        <div class="modal__footer">
          <button type="button" class="btn-secondary" on:click={handleClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" class="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Crear plan'}
          </button>
        </div>
      </form>
    </Modal>
  {/if}
  
  <style>
    .modal__body { display:flex; flex-direction:column; gap: 1rem; }
  
    .form-group { display:flex; flex-direction:column; gap:.35rem; }
    .form-row { display:flex; gap:.75rem; }
    .form-hint { color: var(--color-muted); font-size: .9rem; }
  
    .checkbox-grid {
      display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:.5rem;
      padding:.25rem 0;
    }
    .checkbox-item { display:flex; gap:.5rem; align-items:center; }
  
    .alert.error {
      border: 1px solid var(--color-danger-700, #dc2626);
      background: color-mix(in srgb, var(--color-danger-700, #dc2626) 6%, white);
      color: var(--color-danger-900, #7f1d1d);
      padding: .5rem .6rem;
      border-radius: var(--radius-md);
      font-size: .95rem;
    }
  </style>
  