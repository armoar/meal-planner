<script lang="ts">
    import type { Meal } from '$modules/meals/types';
    import { Trash2 } from 'lucide-svelte';
    import { deleteMeal } from '$modules/meals/api';
  
    export let meal: Meal;
  
    async function remove() {
      if (!confirm(`¿Eliminar "${meal.name}"?`)) return;
      try {
        await deleteMeal(meal.id);
        const ev = new CustomEvent('delete', { detail: { mealId: meal.id } });
        dispatchEvent(ev);
      } catch (e) {
        console.error('No se pudo eliminar el meal', e);
        // TODO: mostrar toast/alert si ya tienes un componente
      }
    }
  </script>
  
  <div class="meal-item card">
    <div class="left">
      <div class="name">{meal.name}</div>
      <div class="meta muted">
        {#if meal.quantity}{meal.quantity}{/if}
        {#if meal.unitId} {meal.unitId}{/if}
        {#if meal.calories} · {Math.round(meal.calories)} kcal{/if}
      </div>
    </div>
    <div class="right">
      <!-- FUTURO: botón editar -->
      <button class="btn-icon-secondary" on:click={remove} aria-label="Eliminar">
        <Trash2 />
      </button>
    </div>
  </div>
  
  <style>
    .meal-item {
      display:flex; align-items:center; justify-content:space-between;
      padding:.5rem .6rem;
    }
    .name { font-weight:600; }
    .meta { font-size:.9rem; }
    .left { display:flex; flex-direction:column; gap:.1rem; }
  </style>
  