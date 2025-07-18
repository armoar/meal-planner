<script lang="ts">
    import { isSidebarCollapsed, isSidebarMobileOpen } from '$stores/sidebarStore';
    import { ChevronLeft, ChevronRight, Menu, PanelLeftOpen, PanelLeftClose } from 'lucide-svelte';
	import { onMount } from 'svelte';
  
    let isMobile = false;
  
    // Detectar si estamos en móvil (puedes usar breakpoints también)
    onMount(() => {
      const updateSize = () => {
        isMobile = window.innerWidth < 768;
      };
  
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    });
  </script>
  
  <header class="header">
    {#if isMobile}
      <button
        class="header__toggle"
        on:click={() => isSidebarMobileOpen.set(true)}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>
    {:else}
      <button
        class="header__toggle"
        on:click={() => isSidebarCollapsed.update(v => !v)}
        aria-label="Colapsar sidebar"
      >
        {#if $isSidebarCollapsed}
          <PanelLeftOpen size={20} />
        {:else}
          <PanelLeftClose size={20} />
        {/if}
      </button>
    {/if}
  
  </header>
  