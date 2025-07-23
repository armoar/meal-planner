<script lang="ts">
  import { onMount } from 'svelte';
  export let onClose: () => void;

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
        max-width: 500px;
        width: 90%;
        padding: 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        position: relative;
        outline: none;
      "
    >
      <!-- Botón de cerrar -->
      <button
        class="btn-text"
        on:click={onClose}
        style="position: absolute; top: 1rem; right: 1rem;"
        aria-label="Cerrar modal"
      >
        ✕
      </button>
  
      <!-- Contenido dinámico del modal -->
      <slot />
    </div>
  </div>
  