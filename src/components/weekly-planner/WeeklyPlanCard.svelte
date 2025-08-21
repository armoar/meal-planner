<script lang="ts">
    import { Eye, Trash2, Calendar } from 'lucide-svelte';
  
    export let startDate: string; // YYYY-MM-DD
    export let endDate: string;   // YYYY-MM-DD
    export let isNew: boolean = false;
  
    export let onView: () => void;
    export let onDelete: () => void;
  
    function rangeLabel(start: string, end: string) {
      const [y1,m1,d1] = start.split('-').map(Number);
      const [y2,m2,d2] = end.split('-').map(Number);
      const s = new Date(Date.UTC(y1, m1-1, d1));
      const e = new Date(Date.UTC(y2, m2-1, d2));
      const short = new Intl.DateTimeFormat('es-ES',{day:'2-digit', month:'short'}).format(s);
      const long  = new Intl.DateTimeFormat('es-ES',{day:'2-digit', month:'short', year:'numeric'}).format(e);
      return `Semana ${short} - ${long}`;
    }
  </script>
  
  <div class="card plan-card {isNew ? 'is-new' : ''}">
    <div class="left">
      <Calendar />
      <div>
        <div class="title">{rangeLabel(startDate, endDate)}</div>
        <div class="subtitle">{startDate} → {endDate}</div>
      </div>
    </div>
    <div class="right">
      <button class="btn-icon-secondary" on:click={onView}>
        <Eye /><span>Ver</span>
      </button>
      <button class="btn-icon-warning" on:click={onDelete}>
        <Trash2 /><span>Eliminar</span>
      </button>
    </div>
  </div>
  
  <style>
    .plan-card{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; }
    .left{ display:flex; align-items:center; gap:.6rem; }
    .title{ font-weight:600; }
    .subtitle{ color:var(--color-muted); font-size:.9rem; }
    .right{ display:flex; gap:.5rem; }
    .is-new{ box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-950) 15%, transparent); }
  </style>
  