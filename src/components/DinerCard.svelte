<script lang="ts">
	import { CircleCheckBig, Edit, Trash, User } from 'lucide-svelte';

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

	<div class="objectives__icon">
		<CircleCheckBig style="width: 2rem; height: 2rem;" 
		aria-label="Objetivos nutricionales"
		/>
	</div>

	<div class="diner-card__objectives">
		{#if caloriesObjective !== undefined}
			<div class="objective">
				<span class="objective-label">Kcal</span>
				<span class="objective-value colorCalories">{caloriesObjective}</span>
			</div>
		{/if}
		{#if carbsObjective !== undefined}
			<div class="objective">
				<span class="objective-label">Hidratos</span>
				<span class="objective-value colorCarbs">{carbsObjective} g</span>
			</div>
		{/if}
		{#if proteinsObjective !== undefined}
			<div class="objective">
				<span class="objective-label">Proteínas</span>
				<span class="objective-value colorProteins">{proteinsObjective} g</span>
			</div>
		{/if}

		{#if fatObjective !== undefined}
			<div class="objective">
				<span class="objective-label">Grasas</span>
				<span class="objective-value colorFat">{fatObjective} g</span>
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
		gap: 1.5rem;
		width: 100%;
	}

	.diner-card__main {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 160px;
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

	.diner-card__objectives {
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

	.objectives__icon {
		width: 2rem;
		height: 2rem;
		border-radius: 9999px;
		color: var(--color-muted);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.objective {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	.objective-value {
		font-weight: 600;
		font-size: 0.9rem;
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

		.diner-card__objectives {
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

		.objective-value {
			font-size: 1rem;
		}

		.objectives__icon{
			display: none;
		}
	}
</style>
