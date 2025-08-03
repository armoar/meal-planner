<script lang="ts">
	import { Edit, Trash, User } from 'lucide-svelte';

	export let name: string;
	export let caloriesObjective: number | undefined;
	export let proteinsObjective: number | undefined;
	export let carbsObjective: number | undefined;
	export let fatObjective: number | undefined;
	export let isNew: boolean = false;

	export let onEdit: () => void;
	export let onDelete: () => void;
</script>

<div class="card {isNew ? 'highlight' : ''} diner-card">
	<!-- Parte izquierda: nombre -->
	<div class="diner-card__main">
        <div class="diner-card__icon">
			<User style="width: 1.1rem; height: 1.1rem;" />
		</div>
		<h3 class="diner-card__name">{name}</h3>
	</div>

	<!-- Parte derecha: objetivos nutricionales -->
	<div class="diner-card__nutrients">
		{#if caloriesObjective !== undefined}
			<div class="nutrient">
				<span class="nutrient-label">Kcal</span>
				<span class="nutrient-value">{caloriesObjective}</span>
			</div>
		{/if}
		{#if proteinsObjective !== undefined}
			<div class="nutrient">
				<span class="nutrient-label">Proteínas</span>
				<span class="nutrient-value">{proteinsObjective} g</span>
			</div>
		{/if}
		{#if carbsObjective !== undefined}
			<div class="nutrient">
				<span class="nutrient-label">Hidratos</span>
				<span class="nutrient-value">{carbsObjective} g</span>
			</div>
		{/if}
		{#if fatObjective !== undefined}
			<div class="nutrient">
				<span class="nutrient-label">Grasas</span>
				<span class="nutrient-value">{fatObjective} g</span>
			</div>
		{/if}
	</div>

	<!-- Botones de acción -->
	<div class="diner-card__actions">
		<button
			type="button"
			on:click={onEdit}
			class="btn-icon"
			aria-label="Editar comensal"
			style="width: 2rem; height: 2rem; padding: 0rem;"
		>
			<Edit style="width: 1rem; height: 1rem;" />
		</button>
		<button
			type="button"
			on:click={onDelete}
			class="btn-icon-warning"
			aria-label="Eliminar comensal"
			style="width: 2rem; height: 2rem; padding: 0rem;"
		>
			<Trash style="width: 1rem; height: 1rem;" />
		</button>
	</div>
</div>

<style>
	.diner-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 3rem;
		width: 100%;
	}

	.diner-card__main {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 180px;
	}

    .diner-card__icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background-color: var(--color-surface-500);
		color: var(--color-primary-950);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.diner-card__name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.diner-card__nutrients {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		min-width: 200px;
		border: 1px solid var(--color-surface-700);
		border-radius: var(--radius-md);
		padding: 0.5rem 1.5rem;
	}

	.nutrient {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	.nutrient-value {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text);
	}

	.diner-card__actions {
		display: flex;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.diner-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.diner-card__main {
			width: 100%;
			gap: 0.5rem;
		}

		.diner-card__nutrients {
			justify-content: space-between;
			width: 100%;
			margin-top: 0.5rem;
			gap: 0.5rem;
		}

		.diner-card__actions {
			margin-top: 0.5rem;
			width: 100%;
			justify-content: flex-end;
		}

		.nutrient-value {
			font-size: 1rem;
		}
	}
</style>
