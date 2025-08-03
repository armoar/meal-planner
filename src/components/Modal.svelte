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

<!-- === Fondo oscuro (overlay) === -->
<div class="modal-overlay" role="presentation" on:click={onClose} tabindex="-1" aria-hidden="true">
	<!-- === Contenedor principal del modal === -->
	<div
		bind:this={modalElement}
		class="modal-container card"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		on:click|stopPropagation
		on:keydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		style="max-width: {maxWidth};"
	>
		<!-- === Encabezado del modal === -->
		<div class="modal-header">
			<h2 class="modal-title">{title}</h2>
			<!-- Botón de cerrar -->
			<button class="btn-text modal-close-btn" on:click={onClose} aria-label="Cerrar modal">
				<X />
			</button>
		</div>

		<!-- === Contenido dinámico === -->
		<slot />
	</div>
</div>

<style>
	.modal-overlay {
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
	}

	.modal-container {
		background: white;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		padding: 2rem;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		position: relative;
		outline: none;
	}

	.modal-header {
		margin-bottom: 4rem;
	}

	.modal-title {
		position: absolute;
		top: 2rem;
		color: var(--color-primary-950);
	}

	.modal-close-btn {
		position: absolute;
		top: 2rem;
		right: 2.5rem;
	}

	@media (max-width: 768px) {
		.modal-container {
			width: 95% !important;
			max-width: 95% !important;
			max-height: 90vh !important;
			padding: 2rem !important;
			border-radius: var(--radius-md) !important;
		}
	}
</style>
