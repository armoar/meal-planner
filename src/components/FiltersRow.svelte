<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, Funnel, ArrowUpDown } from 'lucide-svelte';

	export let showSearch: boolean = true;
	export let showFilter: boolean = true;
	export let showSort: boolean = true;

	export let filterOptions: { id: string; name: string; icon?: string }[] = [];
	export let sortOptions: { id: string; label: string }[] = [];

	export let maxWidth: string | undefined = undefined;

	const dispatch = createEventDispatcher();

	let searchTerm = '';
	let selectedFilter = '';
	let selectedSort = 'name-asc';

	function handleSearch() {
		dispatch('search', searchTerm.trim());
	}

	function handleFilterChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedFilter = target.value;
		dispatch('filter', selectedFilter);
	}

	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedSort = target.value;
		dispatch('sort', selectedSort);
	}
</script>

<div class="filters-row" style="max-width: {maxWidth};">
	{#if showSearch}
		<div class="filters-item search">
			<Search style="width: 1.1rem; height: 1.1rem; color: var(--color-muted);" />
			<input
				class="input search-input"
				type="text"
				placeholder="Buscar..."
				bind:value={searchTerm}
				on:input={handleSearch}
			/>
		</div>
	{/if}

	{#if showFilter}
		<div class="filters-item" style="flex: 1.3;">
			<Funnel style="width: 1.1rem; height: 1.1rem; color: var(--color-muted);" />
			<select class="select" on:change={handleFilterChange}>
				<option value="">Todas las categorías</option>
				{#each filterOptions as opt}
					<option value={opt.id}>{opt.icon} {opt.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	{#if showSort}
		<div class="filters-item">
			<ArrowUpDown style="width: 1.1rem; height: 1.1rem; color: var(--color-muted);" />
			<select class="input select" bind:value={selectedSort} on:change={handleSortChange}>
				<option value="">Ordenar por...</option>
				{#each sortOptions as opt}
					<option value={opt.id}>{opt.label}</option>
				{/each}
			</select>
		</div>
	{/if}
</div>

<style>
	.filters-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
		width: 100%;
        background-color: white;
        z-index: 1;
	}

	.filters-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.search {
		flex: 1.5;
	}

	.search-input {
		flex: 1;
        background-color: white;
	}

	.select {
		padding-right: 2.2rem; /* espacio para chevron */
        background-color: white;
	}

    @media (max-width: 768px) {
        .filters-row {
            flex-direction: column;
            gap: 0.5rem;
            justify-content: left;
            align-items: flex-start;
        }
        .filters-item {
		width: 100%;
		flex: 1;

	}
    }
</style>
