<script lang="ts">
	import { X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	export let onClose: () => void;
	export let title: string;
	export let maxWidth: string = '600px';

	let modalElement: HTMLDivElement;

	onMount(() => {
		modalElement?.focus();
	});
</script>

<!-- Fondo oscuro -->
<div
	class="modal-overlay"
	role="presentation"
	on:click={onClose}
	tabindex="-1"
	aria-hidden="true"
	style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
    "
>
	<!-- Contenedor del modal -->
	<div
		bind:this={modalElement}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		class="card"
		on:click|stopPropagation
		on:keydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		style="
      background: white;
      width: 100%;
      max-width: {maxWidth};
      max-height: 90vh;
      overflow-y: auto;
      padding: 3.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      position: relative;
      outline: none;
    "
	>
		<div style="margin-bottom: 2rem;">
			<h2 style="position: absolute; top: 2rem; color:var(--color-primary-950)">{title}</h2>
			<!-- Botón de cerrar -->
			<button
				class="btn-text"
				on:click={onClose}
				style="position: absolute; top: 2rem; right: 2.5rem;"
				aria-label="Cerrar modal"
			>
				<X />
			</button>
		</div>
		<!-- Contenido dinámico del modal -->
		<slot />
	</div>
</div>

<style>
	@media (max-width: 768px) {
		.card {
			width: 95% !important;
			max-width: 95% !important;
			max-height: 90vh !important;
			padding: 3rem !important;
			border-radius: var(--radius-md) !important;
		}
	}
</style>
