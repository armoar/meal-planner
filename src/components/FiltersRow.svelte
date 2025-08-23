<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Search, Funnel, ArrowUpDown } from 'lucide-svelte';
	import CustomSelect from '$components/CustomSelect.svelte';
  
	export let showSearch: boolean = true;
	export let showFilter: boolean = true;
	export let showSort: boolean = true;
  
	export let filterOptions: { id: string; name: string; icon?: string }[] = [];
	export let sortOptions: { id: string; label: string }[] = [];
  
	export let maxWidth: string | undefined = undefined;
  
	const dispatch = createEventDispatcher();
  
	let searchTerm = '';
  
	// 🔁 valor controlado por el padre
	export let selectedSort: string | null = null;
  
	// Para categorías si las usas
	let selectedFilter = '';
  
	type SelectOption = { value: string; label: string };
	let categoryOptions: SelectOption[] = [];
	let sortSelectOptions: SelectOption[] = [];
  
	$: categoryOptions = [
	  { value: '', label: 'Todas las categorías' },
	  ...filterOptions.map((opt) => ({
		value: opt.id,
		label: `${opt.icon ? opt.icon + ' ' : ''}${opt.name}`
	  }))
	];
  
	$: sortSelectOptions = [
	  // sin placeholder para que “coja” la primera
	  ...sortOptions.map((opt) => ({ value: opt.id, label: opt.label }))
	];
  
	// 🧠 default: si no viene seleccionado o no existe en las opciones, selecciona la primera
	function ensureDefaultSort(selectAndDispatch = false) {
	  const ids = sortOptions.map((o) => o.id);
	  if (!selectedSort || !ids.includes(selectedSort)) {
		selectedSort = ids[0] ?? '';
		if (selectAndDispatch && selectedSort) {
		  dispatch('sort', selectedSort);
		}
	  }
	}
  
	onMount(() => {
	  ensureDefaultSort(true); // emite sort al montar si autoselecciona
	});
  
	$: sortOptions, ensureDefaultSort(false); // si cambian opciones, ajusta valor sin volver a emitir
  
	function handleSearch() {
	  dispatch('search', searchTerm.trim());
	}
  
	function handleFilterChange(e: CustomEvent<{ value: string | null }>) {
	  selectedFilter = e.detail.value ?? '';
	  dispatch('filter', selectedFilter);
	}
  
	function handleSortChange(e: CustomEvent<{ value: string | null }>) {
	  selectedSort = e.detail.value ?? '';
	  dispatch('sort', selectedSort);
	}
  </script>
  
  <div
	class="filters-row"
	style={maxWidth ? `max-width: ${maxWidth};` : ''}
  >
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
		<CustomSelect
		  options={categoryOptions}
		  bind:value={selectedFilter}
		  placeholder="Todas las categorías"
		  on:change={handleFilterChange}
		  fullWidth
		  size="sm"
		/>
	  </div>
	{/if}
  
	{#if showSort}
	  <div class="filters-item">
		<ArrowUpDown style="width: 1.1rem; height: 1.1rem; color: var(--color-muted);" />
		<CustomSelect
		  options={sortSelectOptions}
		  bind:value={selectedSort}
		  on:change={handleSortChange}
		  fullWidth
		  size="sm"
		  clearable={false}
		/>
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
	  z-index: 3;
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
  
	/* Puedes dejar .select por si aún usas selects nativos en otras vistas */
	.select {
	  padding-right: 2.2rem;
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
  