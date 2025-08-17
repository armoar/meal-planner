<script lang="ts">
    import type { Diner } from '$modules/diners/types';
    import { onMount } from 'svelte';
  
    export let diners: Diner[] = [];
    export let selectedIds: string[] = []; // estado controlado desde el padre
    export let label: string = 'Comensales';
  
    // callbacks
    export let onSave: (ids: string[]) => void;
  
    let open = false;
    let localSelected = new Set<string>();
  
    onMount(() => {
      localSelected = new Set(selectedIds);
    });
  
    function toggleOpen() {
      open = !open;
      if (open) {
        localSelected = new Set(selectedIds);
      }
    }
  
    function toggleId(id: string) {
      if (localSelected.has(id)) localSelected.delete(id);
      else localSelected.add(id);
    }
  
    function selectAll() {
      localSelected = new Set(diners.map(d => d.id));
    }
  
    function clearAll() {
      localSelected.clear();
    }
  
    function save() {
      onSave(Array.from(localSelected));
      open = false;
    }
  
    $: count = selectedIds.length;
  </script>
  
  <div class="diner-multi">
    <button class="btn-icon-secondary" type="button" on:click={toggleOpen}>
      {label} {#if count}(<span>{count}</span>){/if}
    </button>
  
    {#if open}
      <div class="diner-multi__menu" role="dialog" aria-label="Seleccionar comensales">
        <div class="diner-multi__actions">
          <button class="btn-text" type="button" on:click={selectAll}>Seleccionar todos</button>
          <button class="btn-text" type="button" on:click={clearAll}>Limpiar</button>
        </div>
  
        <div class="diner-multi__list">
          {#each diners as d}
            <label class="diner-multi__item">
              <input
                type="checkbox"
                checked={localSelected.has(d.id)}
                on:change={() => toggleId(d.id)}
              />
              <span>{d.name}</span>
            </label>
          {/each}
        </div>
  
        <div class="diner-multi__footer">
          <button class="btn-secondary" type="button" on:click={() => (open = false)}>Cancelar</button>
          <button class="btn" type="button" on:click={save}>Guardar</button>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .diner-multi { position: relative; display: inline-block; }
    .diner-multi__menu {
      position: absolute; right: 0; top: 110%;
      min-width: 260px; max-height: 320px; overflow: auto;
      background: #fff; border: 1px solid var(--color-surface-700);
      border-radius: var(--radius-md); box-shadow: var(--shadow-lg); padding: 0.5rem;
      z-index: var(--z-modal);
    }
    .diner-multi__actions { display:flex; justify-content: space-between; gap: .5rem; padding: .25rem .25rem .5rem; border-bottom:1px solid var(--color-surface-700);}
    .diner-multi__list { display:flex; flex-direction: column; gap: .25rem; padding: .5rem .25rem; }
    .diner-multi__item { display:flex; align-items:center; gap:.5rem; padding:.25rem .25rem; }
    .diner-multi__footer { display:flex; justify-content: flex-end; gap:.5rem; padding-top:.5rem; border-top:1px solid var(--color-surface-700); }
    @media (max-width:768px){
      .diner-multi__menu{ right:auto; left:0; width:min(92vw, 360px);}
    }
  </style>
  