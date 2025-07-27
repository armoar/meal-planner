<script lang="ts">
	import '../app.css';
	import Header from '$components/Header.svelte';
	import Sidebar from '$components/Sidebar.svelte';
	import { page } from '$app/stores';

	let lastTopRoute = '';

	$: if (isTopLevel($page.url.pathname) && $page.url.pathname !== lastTopRoute) {
		lastTopRoute = $page.url.pathname;
	}

	function isTopLevel(path: string) {
		return /^\/(weekly-planner|foods|recipes|diners|shopping-list|settings|config)/.test(path);
	}
</script>

<div class="layout">
	<Sidebar />

	<div class="layout__main">
		<Header />
		<main class="main-content">
			<slot />
			<div class="watermark"></div>
		</main>
	</div>
</div>
