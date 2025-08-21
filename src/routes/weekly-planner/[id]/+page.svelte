<script lang="ts">
    import HeaderWeeklyPlanner from '$components/weekly-planner/HeaderWeeklyPlanner.svelte';
    import type { PageData } from './$types';
    import DailyPlanCard from '$components/weekly-planner/DailyPlanCard.svelte';
  
    export let data: PageData;
  
    const toDateUTC = (s: string) => {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    };
  
    let viewMode: 'weekly' | 'daily' = 'weekly';
    let visibleDinerIds: string[] = [...(data.participantIds ?? [])];
  
    function onChangeVisibleDiners(e: CustomEvent<{ visibleDinerIds: string[] }>) {
      visibleDinerIds = e.detail.visibleDinerIds;
    }
    function onChangeView(e: CustomEvent<{ viewMode: 'weekly' | 'daily' }>) {
      viewMode = e.detail.viewMode;
    }
  
    const weekStart = toDateUTC(data.weeklyPlanView.startDate);
    const weekEnd = toDateUTC(data.weeklyPlanView.endDate);
  
    function handleAddMeal(e: CustomEvent<{ dailyPlanId: string; date: string; mealTypeId: string }>) {
      console.log('[AddMeal]', e.detail);
      // TODO: abrir modal de meal
    }
    function handleDeleteMeal(_e: CustomEvent<{ dailyPlanId: string; mealId: string }>) {
      location.reload();
    }
  </script>
  
  <div class="route-container">
    <HeaderWeeklyPlanner
      {weekStart}
      {weekEnd}
      weeklyPlanId={data.weeklyPlanId}
      diners={data.allDiners}
      {visibleDinerIds}
      viewMode={viewMode}
      on:changeVisibleDiners={onChangeVisibleDiners}
      on:changeView={onChangeView}
    />
  
    {#if viewMode === 'weekly'}
      <div class="weekly-list">
        {#each data.weeklyPlanView.dailyPlans as day (day.id)}
          <DailyPlanCard
            {day}
            mealTypes={data.mealTypes}
            visibleDinerIds={visibleDinerIds}
            on:addMeal={handleAddMeal}
            on:deleteMeal={handleDeleteMeal}
          />
        {/each}
      </div>
    {:else}
      <div class="muted">[TODO] Vista diaria</div>
    {/if}
  </div>
  
  <style>
    .weekly-list { display:flex; flex-direction:column; gap:1rem; }
  </style>
  