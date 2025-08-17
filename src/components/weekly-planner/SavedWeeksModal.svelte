<script lang="ts">
  import Modal from '$components/Modal.svelte';
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, ChevronRight } from 'lucide-svelte';

  /** Semanas materializadas: YYYY-MM-DD (lunes) */
  export let weeks: string[] = [];
  /** Control externo de visibilidad */
  export let open = false;
  /** Semana actual (para resaltar) */
  export let currentStart: string | null = null;
  /** Ancho máximo del modal */
  export let maxWidth: string = '680px';

  const dispatch = createEventDispatcher();

  function handleClose() { dispatch('close'); }
  function selectWeek(start: string) { dispatch('select', { start }); }

  // Utils
  function toUTCDate(s: string) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  function formatRange(start: string): string {
    const s = toUTCDate(start);
    const e = new Date(s);
    e.setUTCDate(s.getUTCDate() + 6);
    const short = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' });
    const long = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${short.format(s)} - ${long.format(e)}`;
  }
  function monthLabel(year: string, monthIdx: number) {
    const d = new Date(Date.UTC(Number(year), monthIdx, 1));
    const name = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(d);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Agrupar: year -> monthIdx -> weeks[]
  $: grouped = weeks.reduce((acc: Record<string, Record<number, string[]>>, w) => {
    const [y, m] = w.split('-');
    const year = y;
    const monthIdx = Number(m) - 1; // 0..11
    acc[year] ||= {};
    acc[year][monthIdx] ||= [];
    acc[year][monthIdx].push(w);
    return acc;
  }, {});

  // Años descendente; meses descendente; semanas descendente
  $: years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  function monthsOf(year: string) {
    return Object.keys(grouped[year])
      .map(Number)
      .sort((a, b) => b - a);
  }
  function weeksOf(year: string, monthIdx: number) {
    return [...grouped[year][monthIdx]].sort((a, b) => b.localeCompare(a));
  }

  // Estado de expansión
  let expandedYears = new Set<string>();
  let expandedMonths = new Set<string>(); // clave "YYYY-MM"
  let initialized = false;

  function ymKey(year: string, monthIdx: number) {
    return `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
  }

  function toggleYear(year: string) {
    expandedYears.has(year) ? expandedYears.delete(year) : expandedYears.add(year);
    expandedYears = new Set(expandedYears);
  }
  function toggleMonth(year: string, monthIdx: number) {
    const key = ymKey(year, monthIdx);
    expandedMonths.has(key) ? expandedMonths.delete(key) : expandedMonths.add(key);
    expandedMonths = new Set(expandedMonths);
  }

  function expandAll() {
    expandedYears = new Set(years);
    expandedMonths = new Set(
      years.flatMap((y) => monthsOf(y).map((m) => ymKey(y, m)))
    );
  }
  function collapseAll() {
    expandedYears = new Set();
    expandedMonths = new Set();
  }

  // Al abrir, expandir por defecto el año/mes de currentStart; si no hay, el más reciente
  $: if (open && !initialized) {
    initialized = true;
    if (currentStart && weeks.includes(currentStart)) {
      const [y, m] = currentStart.split('-');
      expandedYears.add(y);
      expandedMonths.add(`${y}-${m}`);
    } else if (years.length) {
      const y = years[0];
      const ms = monthsOf(y);
      if (ms.length) {
        expandedYears.add(y);
        expandedMonths.add(ymKey(y, ms[0]));
      }
    }
    expandedYears = new Set(expandedYears);
    expandedMonths = new Set(expandedMonths);
  }

  // Si se cierra, resetea init para recalcular expansión al abrir de nuevo
  $: if (!open) initialized = false;
</script>

{#if open}
  <Modal title="Semanas guardadas" onClose={handleClose} {maxWidth}>
    <div class="toolbar">
      <button class="btn-text" on:click={expandAll}>Expandir todo</button>
      <button class="btn-text" on:click={collapseAll}>Contraer todo</button>
    </div>

    {#if years.length === 0}
      <div class="muted">No hay semanas guardadas.</div>
    {:else}
      <div class="tree">
        {#each years as y}
          <div class="tree__year">
            <button class="tree__year-row" on:click={() => toggleYear(y)} aria-expanded={expandedYears.has(y)}>
              {#if expandedYears.has(y)}<ChevronDown size="18" />{:else}<ChevronRight size="18" />{/if}
              <span class="year-label">{y}</span>
              <span class="pill">{Object.values(grouped[y]).reduce((sum, arr) => sum + arr.length, 0)} semanas</span>
            </button>

            {#if expandedYears.has(y)}
              <div class="tree__months">
                {#each monthsOf(y) as m}
                  <div class="tree__month">
                    <button class="tree__month-row" on:click={() => toggleMonth(y, m)} aria-expanded={expandedMonths.has(ymKey(y,m))}>
                      {#if expandedMonths.has(ymKey(y,m))}<ChevronDown size="16" />{:else}<ChevronRight size="16" />{/if}
                      <span class="month-label">{monthLabel(y, m)}</span>
                      <span class="pill">{weeksOf(y, m).length} semanas</span>
                    </button>

                    {#if expandedMonths.has(ymKey(y,m))}
                      <div class="tree__weeks">
                        {#each weeksOf(y, m) as w}
                          <button
                            class="week-row {currentStart === w ? 'is-current' : ''}"
                            on:click={() => selectWeek(w)}
                            aria-label={`Abrir semana ${w}`}
                          >
                            <div class="week-row__title">{formatRange(w)}</div>
                            <div class="week-row__subtitle">{w}</div>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </Modal>
{/if}

<style>
  .toolbar {
    display: flex;
    gap: .5rem;
    justify-content: flex-end;
    margin-bottom: .5rem;
  }

  .tree { display: flex; flex-direction: column; gap: .25rem; }
  .tree__year { border: 1px solid var(--color-surface-700); border-radius: var(--radius-md); background: #fff; }
  .tree__year + .tree__year { margin-top: .4rem; }

  .tree__year-row, .tree__month-row {
    width: 100%; display: flex; align-items: center; gap: .5rem;
    padding: .55rem .65rem; background: transparent; text-align: left;
  }

  .tree__months { padding-left: .5rem; padding-bottom: .25rem; }
  .tree__month { border-top: 1px dashed var(--color-surface-700); }
  .tree__weeks { display: flex; flex-direction: column; gap: .25rem; padding: .25rem .65rem .65rem 2rem; }

  .year-label, .month-label { font-weight: 600; }
  .pill {
    margin-left: auto;
    font-size: .85rem;
    color: var(--color-muted);
    background: var(--color-surface-50, #f8f9fa);
    padding: .1rem .4rem;
    border-radius: 9999px;
    border: 1px solid var(--color-surface-700);
  }

  .week-row {
    width: 100%;
    display: flex; flex-direction: column; gap: .1rem;
    padding: .55rem .65rem;
    border: 1px solid var(--color-surface-700);
    border-radius: var(--radius-md);
    background: #fff; text-align: left;
  }
  .week-row:hover { background: var(--color-surface-50, #f8f9fa); }
  .week-row__title { font-weight: 600; }
  .week-row__subtitle { color: var(--color-muted); font-size: .9rem; }

  .week-row.is-current {
    border-color: var(--color-primary-950);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-950) 20%, transparent);
  }

  @media (max-width: 768px) {
    .toolbar { justify-content: flex-start; }
  }
</style>
