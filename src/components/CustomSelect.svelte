<script lang="ts">
	import { ChevronDown, X } from 'lucide-svelte';
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  
    // Tipo local sencillo (no exportamos para evitar conflictos de Svelte)
    type SelectOption = { value: string; label: string };
  
    export let options: SelectOption[] = [];
    export let value: string | null = null;
    export let placeholder: string = 'Selecciona una opción';
    export let disabled: boolean = false;
    export let maxHeight: number = 240;
    export let fullWidth: boolean = false;
    export let clearable: boolean = false;
    export let size: 'sm' | 'md' | 'lg' = 'md';
  
    const dispatch = createEventDispatcher<{
      change: { value: string | null; label: string | null };
      open: { open: boolean };
    }>();
  
    let open = false;
    let rootEl: HTMLDivElement;
    let btnEl: HTMLButtonElement;
    let listEl: HTMLDivElement;
    let activeIndex = -1;
  
    $: selectedIndex = options.findIndex((o) => o.value === value);
    $: selected = selectedIndex >= 0 ? options[selectedIndex] : null;
    $: listStyle = `max-height:${maxHeight}px;`;
    $: displayText = selected ? selected.label : placeholder;
  
    function toggle() {
      if (disabled) return;
      open = !open;
      dispatch('open', { open });
      if (open) {
        activeIndex = selectedIndex >= 0 ? selectedIndex : options.length ? 0 : -1;
        queueMicrotask(() => {
          const activeEl = listEl?.querySelector('[tabindex="0"]') as HTMLElement | null;
          (activeEl ?? listEl)?.focus();
        });
      }
    }
  
    function close() {
      if (!open) return;
      open = false;
      dispatch('open', { open });
      activeIndex = -1;
      btnEl?.focus();
    }
  
    function selectIndex(i: number) {
      if (i < 0 || i >= options.length) return;
      const opt = options[i];
      value = opt.value;
      dispatch('change', { value: opt.value, label: opt.label });
      close();
    }
  
    function onKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex < 0 ? 0 : activeIndex + 1, options.length - 1);
        ensureVisible(activeIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex < 0 ? 0 : activeIndex - 1, 0);
        ensureVisible(activeIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0) selectIndex(activeIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        close();
      }
    }
  
    function ensureVisible(i: number) {
      const child = listEl?.children[i] as HTMLElement | undefined;
      if (!child || !listEl) return;
      const cTop = child.offsetTop;
      const cBottom = cTop + child.offsetHeight;
      if (cTop < listEl.scrollTop) listEl.scrollTop = cTop;
      else if (cBottom > listEl.scrollTop + listEl.clientHeight)
        listEl.scrollTop = cBottom - listEl.clientHeight;
    }
  
    function onOptionMouseEnter(i: number) {
      activeIndex = i;
    }
  
    // Acepta cualquier evento y es opcional para evitar conflictos Mouse/Keyboard
    function clearSelection(evt?: Event) {
      evt?.stopPropagation?.();
      value = null;
      dispatch('change', { value: null, label: null });
    }
  
    function handleClickOutside(e: MouseEvent) {
      if (!rootEl) return;
      if (!rootEl.contains(e.target as Node)) close();
    }
  
    onMount(() => {
      document.addEventListener('mousedown', handleClickOutside);
    });
    onDestroy(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });
  </script>
  
  <div
    class="mp-select {fullWidth ? 'mp-select--full' : ''} {disabled ? 'mp-select--disabled' : ''} {size === 'sm' ? 'mp-select--sm' : size === 'lg' ? 'mp-select--lg' : ''}"
    bind:this={rootEl}
  >
    <button
      class="mp-select__btn {open ? 'mp-select__btn--open' : ''}"
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls="mp-select-listbox"
      {disabled}
      on:click={toggle}
      bind:this={btnEl}
    >
      {#if selected}
        <span>{displayText}</span>
      {:else}
        <span class="mp-select__placeholder">{displayText}</span>
      {/if}
  
      <div style="display:flex; align-items:center; gap:.5rem;">
        {#if clearable && selected}
          <!-- span accesible (no button dentro de button) -->
          <span
            class="mp-select__clear"
            role="button"
            tabindex="0"
            aria-label="Limpiar selección"
            on:click|stopPropagation={clearSelection}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                clearSelection();
              }
            }}
          >
            <X/>
          </span>
        {/if}
        <span aria-hidden="true" class="mp-select__chevron"></span>
      </div>
    </button>
  
    <div
      id="mp-select-listbox"
      class="mp-select__list {open ? 'mp-select__list--open' : ''}"
      role="listbox"
      tabindex="0"
      style={listStyle}
      on:keydown={onKeyDown}
      bind:this={listEl}
    >
      {#if options.length === 0}
        <div class="mp-select__option" aria-disabled="true">Sin opciones</div>
      {:else}
        {#each options as opt, i}
          <div
            role="option"
            id={"mp-opt-" + i}
            class="mp-select__option {i === activeIndex ? 'mp-select__option--active' : ''}"
            aria-selected={opt.value === value}
            tabindex={i === activeIndex ? 0 : -1}
            on:mouseenter={() => onOptionMouseEnter(i)}
            on:mousedown|preventDefault={() => selectIndex(i)}
          >
            {opt.label}
          </div>
        {/each}
      {/if}
    </div>
  </div>
  
  <style>
    /* Deja este bloque vacío o mínimo; el look principal está en app.css (mp-select*) */
  </style>
  