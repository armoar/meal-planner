<script lang="ts">
	import { Trash, Weight, Edit } from 'lucide-svelte';
	export let name: string;
	export let symbol: string;
	export let conversionFactor: number;
	export let isNew: boolean = false;
	export let onEdit: () => void;
	export let onDelete: () => void;
</script>

<div
	class="card {isNew ? 'highlight' : ''}"
	style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;"
>
	<div class="unit-card">
		<div class="unit-card__main">
			<div class="unit-card__icon">
				<Weight style="width: 1.1rem; height: 1.1rem;" />
			</div>

			<div class="unit-card__content">
				<!-- Línea superior: nombre y símbolo -->
				<div class="unit-card__name">
					<h3>{name}</h3>
					<span>{symbol}</span>
				</div>

				<!-- Línea inferior: factor -->
				<p class="unit-card__factor">
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
		aria-label="Editar unidad"
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

<style>
	.unit-card {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: none;
		padding: 0;
	}

	.unit-card__main {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.unit-card__icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background-color: var(--color-surface-500);
		color: var(--color-primary-950);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.unit-card__content {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

  .unit-card__name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .unit-card__name h3 {
    font-size: 1rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .unit-card__name span {
    color: var(--color-muted);
  }

  .unit-card__factor {
    font-size: 0.875rem;
    color: var(--color-muted);
  }
</style>
