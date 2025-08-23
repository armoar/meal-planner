<script lang="ts">
	import { Eye, Trash2, Calendar } from 'lucide-svelte';

	export let startDate: string; // YYYY-MM-DD
	export let endDate: string; // YYYY-MM-DD
	export let isNew: boolean = false;

	export let onView: () => void;
	export let onDelete: () => void;

	function rangeLabel(start: string, end: string) {
  const [y1,m1,d1] = start.split('-').map(Number);
  const [y2,m2,d2] = end.split('-').map(Number);
  const s = new Date(Date.UTC(y1, m1-1, d1));
  const e = new Date(Date.UTC(y2, m2-1, d2));

  const fmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'short' });
  const startTxt = fmt.format(s);
  const endTxt   = fmt.format(e);

  return `Lunes ${startTxt} → Domingo ${endTxt}`;
}

</script>

<div class="card plan-card {isNew ? 'is-new' : ''}">
	<div class="left">
    <div class="icon">
      <Calendar style="width: 1rem; height: 1rem; color: var(--color-primary-950)" />
    </div>
		<div>
			<div class="title">{rangeLabel(startDate, endDate)}</div>
		</div>
	</div>
	<div class="right">
		<button
			class="btn-icon"
			on:click={onView}
			style="width: 2rem; height: 2rem;padding:0rem"
		>
			<Eye style="width: 1rem; height: 1rem;" />
		</button>
		<button
			class="btn-icon-warning"
			on:click={onDelete}
			style="width: 2rem; height: 2rem;padding:0rem"
		>
			<Trash2 style="width: 1rem; height: 1rem;" />
		</button>
	</div>
</div>

<style>
	.card {
		padding: 0.7rem;
	}
	.plan-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		
	}
	.left {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.title {
		font-weight: 600;
	}
  .icon{
    width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background-color: var(--color-surface-500);
		color: var(--color-primary-950);
		display: flex;
		align-items: center;
		justify-content: center;
  }
	.right {
		display: flex;
		gap: 0.5rem;
	}
	.is-new {
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary-950) 15%, transparent);
	}
	@media (max-width: 768px) {
		.title{
			font-size: 14px;
		}
		.icon{
			display: none;
		}
	}
</style>
