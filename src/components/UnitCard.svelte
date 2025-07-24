<script lang="ts">
  import { Trash, Weight, Edit } from 'lucide-svelte';
  export let name: string;
  export let symbol: string;
  export let conversionFactor: number;
  export let isNew: boolean = false;
  export let onEdit: () => void;
  export let onDelete: () => void;
</script>

<div class="card {isNew ? 'highlight' : ''}" style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
  <div
    style="
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: none;
      background: white;
      padding: 0;
      z-index: 1;
    "
  >
    <div style="display: flex; align-items: center; gap: 1rem;">
      <div style="
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 9999px;
        background-color: var(--color-surface-500);
        color: var(--color-primary-950);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <Weight style="width: 1.1rem; height: 1.1rem;" />
      </div>

      <div style="display: flex; flex-direction: column; justify-content: center;">
        <!-- Línea superior: nombre y símbolo -->
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h3 style="font-size: 1rem; font-weight: 600; white-space: nowrap;">{name}</h3>
          <span style="color: var(--color-muted);">{symbol}</span>
        </div>
      
        <!-- Línea inferior: factor -->
        <p style="font-size: 0.875rem; color: var(--color-muted);">
          Factor: {conversionFactor}
        </p>
      </div>
    </div>
  </div>

  <button
  type="button"
  on:click={onEdit}
  class="btn-icon"
  style="width: 2rem; height: 2rem;padding:0rem"
  aria-label="Eliminar unidad"
>
<Edit style="width: 1rem; height: 1rem;" />
  </button>

  <button
    type="button"
    on:click={onDelete}
    class="btn-icon-warning"
    style="width: 2rem; height: 2rem;padding:0rem"
    aria-label="Eliminar unidad"
  >
    <Trash style="width: 1rem; height: 1rem;" />
  </button>
</div>
