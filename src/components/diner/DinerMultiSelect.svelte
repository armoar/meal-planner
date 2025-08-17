<script lang="ts">
	import type { Diner } from '$modules/diners/types';
	import { Users } from 'lucide-svelte';
	import { onMount, createEventDispatcher } from 'svelte';

	export let diners: Diner[] = [];
	export let selectedIds: string[] = [];
	export let label: string = 'Comensales';
	export let iconOnlyOnMobile: boolean = false; // ⬅️ NUEVO

	export let onSave: (ids: string[]) => void;

	let open = false;
	let localSelected = new Set<string>();
	const dispatch = createEventDispatcher();

	onMount(() => {
		localSelected = new Set(selectedIds);
	});

	function toggleOpen() {
		open = !open;
		if (open) localSelected = new Set(selectedIds);
	}
	function toggleId(id: string) {
		localSelected.has(id) ? localSelected.delete(id) : localSelected.add(id);
	}
	function selectAll() {
		localSelected = new Set(diners.map((d) => d.id));
	}
	function clearAll() {
		localSelected.clear();
	}
	function save() {
		onSave(Array.from(localSelected));
		open = false;
		dispatch('saved');
	}

	$: count = selectedIds.length;
</script>

<div class="diner-multi">
	<button
		class="diner-multi__btn btn-icon-secondary"
		type="button"
		on:click={toggleOpen}
		aria-label={`Comensales${selectedIds?.length ? ` (${selectedIds.length})` : ''}`}
	>
		<Users class="leading-icon" aria-hidden="true" />
		<span class="label">Comensales</span>
		{#if selectedIds?.length}<span class="count">({selectedIds.length})</span>{/if}
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
				<button class="btn-secondary" type="button" on:click={() => (open = false)}>Cancelar</button
				>
				<button class="btn" type="button" on:click={save}>Guardar</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.diner-multi {
		position: relative;
		display: inline-block;
	}
	.diner-multi__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
  
	.diner-multi__menu {
		position: absolute;
		right: 0;
		top: 110%;
		min-width: 260px;
		max-height: 320px;
		overflow: auto;
		background: #fff;
		border: 1px solid var(--color-surface-700);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: 0.5rem;
		z-index: var(--z-modal);
	}
	.diner-multi__actions {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.25rem 0.25rem 0.5rem;
		border-bottom: 1px solid var(--color-surface-700);
	}
	.diner-multi__list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0.25rem;
	}
	.diner-multi__item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.25rem;
	}
	.diner-multi__footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-surface-700);
	}

	@media (max-width: 768px) {
		.diner-multi__btn {
			justify-content: center;
			width: 100%;
		}
		.diner-multi__btn .label,
		.diner-multi__btn .count {
			display: none;
		}
	}
</style>
