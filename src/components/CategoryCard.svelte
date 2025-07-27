<script lang="ts">
	import { Trash, Edit } from 'lucide-svelte';
	export let name: string;
	export let icon: string;
	export let color: string;
	export let isNew: boolean = false;
	export let onEdit: () => void;
	export let onDelete: () => void;
    console.log('props →', { name, icon, color });
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
		background-color:{color};
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		
	"
			>
				{icon}
			</div>

			<div style="display: flex; flex-direction: column; justify-content: center;">
				<h3 style="font-size: 1rem; font-weight: 600; white-space: nowrap;">{name}</h3>
			</div>
		</div>
	</div>

	<button
		type="button"
		on:click={onEdit}
		class="btn-icon"
		style="width: 2rem; height: 2rem;padding:0rem"
		aria-label="Editar categoría"
	>
		<Edit style="width: 1rem; height: 1rem;"/>
	</button>

	<button
		type="button"
		on:click={onDelete}
		class="btn-icon-warning"
		style="width: 2rem; height: 2rem;padding:0rem"
		aria-label="Eliminar categoría"
	>
		<Trash style="width: 1rem; height: 1rem;" />
	</button>
</div>
