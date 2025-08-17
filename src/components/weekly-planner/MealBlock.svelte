<script lang="ts">
    import type { Meal } from '$modules/weeklyPlans/types';
    import type { MealType } from '$modules/mealTypes/types';
    import MealItemCard from './MealItemCard.svelte';
    import { Plus } from 'lucide-svelte';
  
    export let mealType: MealType;
    export let meals: Meal[] = [];
  
    // Eventos que burbujean hacia el padre: add y delete
    function add() {
      const ev = new CustomEvent('add');
      dispatchEvent(ev);
    }
    function onDelete(mealId: string) {
      const ev = new CustomEvent('delete', { detail: { mealId } });
      dispatchEvent(ev);
    }
  </script>
  
  <div class="meal-block">
    <div class="meal-block__header">
      <div class="title">{mealType.name}</div>
      <button class="btn-icon-secondary" on:click={add} aria-label={`Añadir a ${mealType.name}`}>
        <Plus />
        <span class="btn-label">Añadir</span>
      </button>
    </div>
  
    {#if meals.length === 0}
      <div class="muted" style="padding:.25rem .25rem .5rem;">No hay elementos</div>
    {:else}
      <div class="meal-list">
        {#each meals as meal (meal.id)}
          <MealItemCard meal={meal} on:delete={(e) => onDelete(e.detail.mealId)} />
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    .meal-block { border:1px solid var(--color-surface-700); border-radius: var(--radius-md); background:#fff; }
    .meal-block__header {
      display:flex; align-items:center; justify-content:space-between;
      padding:.5rem .6rem; border-bottom:1px solid var(--color-surface-700);
    }
    .meal-block__header .title { font-weight:600; }
    .meal-list { display:flex; flex-direction:column; gap:.35rem; padding:.5rem; }
    @media (max-width:768px){ .btn-label{ display:none; } }
  </style>
  