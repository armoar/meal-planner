<script lang="ts">
	export let title: string;
</script>

<div
	class="header-actions"
	style="
    width: 100%;
    max-width: 600px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0rem;
    border-bottom: 1px solid var(--color-surface-700);
    margin-bottom: 1rem;
  "
>
	<div>
		<h1 style="font-size: 1.7rem; font-weight: 600; margin-bottom: 0.25rem;">{title}</h1>
	</div>

	<div>
		<slot />
	</div>
</div>
