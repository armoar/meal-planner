<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let id: string;
	export let name: string;
	export let selected: boolean = true;
  
	const dispatch = createEventDispatcher();
  
	function toggle() {
	  dispatch('toggle', { id });
	}
  </script>
  
  <button class="diner-toggle" aria-pressed={selected} on:click={toggle} type="button">
	<span class="diner-toggle__indicator" data-selected={selected}></span>
	<span class="diner-toggle__label">{name}</span>
  </button>
  