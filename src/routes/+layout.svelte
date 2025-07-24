<script lang="ts">
	import '../app.css';
	import Header from '$components/Header.svelte';
	import Sidebar from '$components/Sidebar.svelte';
	import { page } from '$app/stores';
	import { tick } from 'svelte';

	let routeClass = '';
	let lastTopRoute = '';

	$: if (isTopLevel($page.url.pathname) && $page.url.pathname !== lastTopRoute) {
		animateRoute();
		lastTopRoute = $page.url.pathname;
	}

	function isTopLevel(path: string) {
		return /^\/(weekly-planner|foods|recipes|diners|shopping-list|settings|config)/.test(path);
	}

	async function animateRoute() {
		routeClass = 'route-transition';
		await tick();
		setTimeout(() => (routeClass = ''), 300);
	}
</script>

<div class="layout">
	<Sidebar />

	<div class="layout__main">
		<Header />
		<main class="main-content">
			<div class={`route-container ${routeClass}`}>
				<slot />
			</div>
		</main>
	</div>
</div>
