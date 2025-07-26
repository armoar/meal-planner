<script lang="ts">
	import { createEventDispatcher } from 'svelte';
import { Edit, Trash, Coffee, Sun, Moon, Banana, Utensils } from 'lucide-svelte';

export let name: string;
export let order: number;
export let isProtected: boolean = false;
export let isNew: boolean = false;

const dispatch = createEventDispatcher();

function edit() {
	dispatch('edit');
}

function remove() {
	dispatch('delete');
}

function getIconComponent(name: string) {
	const normalized = name.trim().toLowerCase();

	if (normalized === 'desayuno') return Coffee;
	if (normalized === 'almuerzo') return Sun;
	if (normalized === 'cena') return Moon;
	if (normalized === 'snack') return Banana;

	return Utensils;
}

</script>

<div
	class="card {isNew ? 'highlight' : ''}"
	style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;"
>
	<div
		style="
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: none;
        padding: 0;
      "
	>
		<div style="display: flex; align-items: center; gap: 1rem;">
			<div
				style="
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          background-color: var(--color-surface-500);
          color: var(--color-primary-950);
          display: flex;
          align-items: center;
          justify-content: center;
        "
			>
            <svelte:component this={getIconComponent(name)} style="width: 1.1rem; height: 1.1rem;" />
			</div>
			<div style="display: flex; flex-direction: column; justify-content: center;">
				<strong>{order} - {name}</strong>
			</div>

			

			
		</div>
	</div>
    <div class="card-actions" style="display: flex; gap: 0.5rem;">
        <button
            class="btn-icon"
            style="width: 2rem; height: 2rem;padding:0rem"
            aria-label="Editar unidad"
            disabled
        >
            <Edit size="18" />
        </button>

        {#if !isProtected}
            <button
                class="btn-icon-warning"
                style="width: 2rem; height: 2rem;padding:0rem"
                aria-label="Eliminar unidad"
                disabled
            >
                <Trash size="18" />
            </button>
        {/if}
    </div>
</div>

<style>
    .btn-icon:disabled {
	background-color: var(--color-surface-700);
	color: var(--color-muted);
	cursor: not-allowed;
	box-shadow: none;
	transform: none;
}
    .btn-icon-warning:disabled {
	background-color: var(--color-surface-700);
	color: var(--color-muted);
	cursor: not-allowed;
	box-shadow: none;
	transform: none;
}

</style>
