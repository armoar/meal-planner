<script lang="ts">
	import { isSidebarCollapsed, isSidebarMobileOpen } from '$stores/sidebarStore';
	import {
		Calendar,
		Apple,
		UtensilsCrossed,
		ShoppingCart,
		Settings,
		PanelLeft,
		ChevronLeft,
		ChevronRight,
		ChevronDown,
		Tags,
		Scale,
		Utensils,
		CookingPot,
		Users

	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	let configOpen = false;

	const menuItems = [
		{ href: '/weekly-planner', icon: Calendar, label: 'Planificador semanal' },
		{ href: '/foods', icon: Apple, label: 'Alimentos' },
		{ href: '/recipes', icon: CookingPot, label: 'Recetas' },
		{ href: '/shopping-list', icon: ShoppingCart, label: 'Lista de la compra' }
	];

	const configItems = [
		{ href: '/settings/diners', label: 'Comensales', icon: Users },
		{ href: '/settings/categories', label: 'Categorías', icon: Tags },
		{ href: '/settings/units', label: 'Unidades', icon: Scale },
		{ href: '/settings/meal-types', label: 'Comidas del día', icon: Utensils }
		
	];

	export const isMobile = writable(false);

	onMount(() => {
		const check = () => isMobile.set(window.innerWidth < 768);
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	});

	let isClosing = false;

function closeSidebarSmoothly() {
  isClosing = true;
  setTimeout(() => {
    isSidebarMobileOpen.set(false);
    isClosing = false;
  }, 300); // mismo tiempo que la animación
}

</script>

{#if $isSidebarMobileOpen}
	<div
		class="sidebar__overlay"
		on:click={() => isSidebarMobileOpen.set(false)}
		aria-hidden="true"
	></div>
{/if}

<aside
	class="sidebar"
	class:collapsed={$isSidebarCollapsed}
	class:sidebar--mobile={$isSidebarMobileOpen && $isMobile}
	class:open={$isSidebarMobileOpen && $isMobile}
>
	{#if $isSidebarMobileOpen}
		<button
			class="sidebar__close-btn"
			on:click={() => isSidebarMobileOpen.set(false)}
			aria-label="Cerrar menú"
		>
		</button>
	{/if}

	<div class="sidebar__logo">
		<img
			src="/logo_mp_950.svg"
			alt="Logo"
			class="sidebar__logo-icon"
			class:collapsed={$isSidebarCollapsed}
		/>

		<img
			src="/lettering_mp_950.svg"
			alt="Meal Planner"
			class="sidebar__logo-text"
			class:collapsed={$isSidebarCollapsed}
		/>
	</div>

	<nav class="sidebar__nav">
		{#each menuItems as { href, icon: Icon, label }}
			<a
				class="sidebar__nav-item {$page.url.pathname.startsWith(href) ? 'active' : ''}"
				{href}
				on:click={() => {
					if ($isSidebarMobileOpen) isSidebarMobileOpen.set(false);
				}}
			>
				<Icon size={18} stroke-width={2.5} />
				<span class="sidebar__nav-label" class:collapsed={$isSidebarCollapsed}>
					{label}
				</span>
			</a>
		{/each}
		<!-- Item Configuración -->
		<button
			type="button"
			class="sidebar__nav-item config-parent"
			on:click={() => {
				if ($isSidebarCollapsed) {
					isSidebarCollapsed.set(false);
					setTimeout(() => {
						configOpen = true;
					}, 200); // espera a que se expanda el sidebar
				} else {
					configOpen = !configOpen;
				}
			}}
			aria-expanded={configOpen}
			aria-controls="config-subitems"
		>
			<Settings size={18} />
			{#if !$isSidebarCollapsed}
				<span class="sidebar__nav-label">Configuración</span>
				<span class="sidebar__nav-chevron" class:open={configOpen}>
					{#if configOpen}
						<ChevronDown size={16} />
					{:else}
						<ChevronRight size={16} />
					{/if}
				</span>
			{/if}
		</button>

		<!-- Subitems -->
		{#if configOpen && !$isSidebarCollapsed}
			<div class="sidebar__nav-subitems" id="config-subitems" transition:fade={{ duration: 200 }}>
				{#each configItems as { href, label, icon: Icon }}
					<a
						{href}
						class="sidebar__nav-item {$page.url.pathname.startsWith(href) ? 'active' : ''}"
						on:click={() => {
							if ($isSidebarMobileOpen) isSidebarMobileOpen.set(false);
						}}
					>
						<Icon size={18} stroke-width={2} />
						<span class="sidebar__nav-label">{label}</span>
					</a>
				{/each}
			</div>
		{/if}
	</nav>

	<footer class="sidebar__footer">
		{#if !$isSidebarCollapsed}
			Planificador v1.0
		{/if}
	</footer>
</aside>
