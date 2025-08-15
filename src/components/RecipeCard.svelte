<script lang="ts">
	import { CookingPot, Edit, Trash } from 'lucide-svelte';

	export let name: string;
	export let servings: number;
	export let totalCalories: number;
	export let totalProteins: number;
	export let totalCarbs: number;
	export let totalFat: number;

	export let isNew: boolean = false;

	export let onEdit: () => void;
	export let onDelete: () => void;
</script>

<div class="card {isNew ? 'highlight' : ''} recipe-card">
	<!-- Parte izquierda: nombre -->
	<div class="recipe-card__main">
		<div class="recipe-card__icon">
			<CookingPot style="width: 1.1rem; height: 1.1rem;" />
		</div>
		<div class="recipe-card__content">
			<h3>{name}</h3>
			<span>Raciones: {servings}</span>
			
		</div>
	</div>

	<!-- Parte derecha: info nutricional -->
	<div class="recipe-card__nutrients">
		<div class="nutrient">
			<span class="nutrient-label">Kcal</span>
			<span class="nutrient-value colorCalories">{totalCalories}</span>
		</div>
		<div class="nutrient">
			<span class="nutrient-label">Hidratos</span>
			<span class="nutrient-value colorCarbs">{totalCarbs} g</span>
		</div>
		<div class="nutrient">
			<span class="nutrient-label">Proteínas</span>
			<span class="nutrient-value colorProteins">{totalProteins} g</span>
		</div>
		
		<div class="nutrient">
			<span class="nutrient-label">Grasas</span>
			<span class="nutrient-value colorFat">{totalFat} g</span>
		</div>
	</div>

	<!-- Botones de acción -->
	<div class="recipe-card__actions">
		<button
			type="button"
			on:click={onEdit}
			class="btn-icon"
			aria-label="Editar receta"
			style="width: 2rem; height: 2rem; padding: 0;"
		>
			<Edit style="width: 1rem; height: 1rem;" />
		</button>

		<button
			type="button"
			on:click={onDelete}
			class="btn-icon-warning"
			aria-label="Eliminar receta"
			style="width: 2rem; height: 2rem; padding: 0;"
		>
			<Trash style="width: 1rem; height: 1rem;" />
		</button>
	</div>
</div>

<style>
	.recipe-card {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 3rem;
		width: 100%;
	}

	.recipe-card__main {
		
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		min-width: 180px;
	}

	.recipe-card__icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background-color: var(--color-surface-500);
		color: var(--color-primary-950);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.recipe-card__content {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.recipe-card__content h3 {
		font-size: 1rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.recipe-card__content span {
		color: var(--color-muted);
	}

	.recipe-card__nutrients {
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
	}

	.recipe-card__actions {
		display: flex;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.recipe-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.recipe-card__main {
			width: 100%;
		}

		.recipe-card__icon {
			width: 2rem;
			height: 2rem;
			font-size: 1rem;
		}

		.recipe-card__nutrients {
			justify-content: space-between;
			width: 100%;
			margin-top: 0.5rem;
			gap: 0.5rem;
		}

		.recipe-card__actions {
			margin-top: 0.5rem;
			width: 100%;
			justify-content: flex-end;
		}

		.nutrient-value {
			font-size: 1rem;
		}
	}
</style>
