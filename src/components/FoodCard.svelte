<script lang="ts">
	import { Edit, Trash } from 'lucide-svelte';

	export let name: string;
	export let categoryIcon: string;
	export let categoryColor: string;

	export let calories: number;
	export let proteins: number;
	export let carbs: number;
	export let fat: number;
	export let isNew: boolean = false;

	export let onEdit: () => void;
	export let onDelete: () => void;
</script>

<div class="card {isNew ? 'highlight' : ''} food-card">
	<!-- Parte izquierda: icono + nombre -->
	<div class="food-card__main">
		<div class="food-card__icon" style="background-color: {categoryColor};">
			{categoryIcon}
		</div>

		<h3 class="food-card__name">{name}</h3>
	</div>

	<!-- Parte derecha: info nutricional -->
	<div class="food-card__nutrients">
		<div class="nutrient">
			<span class="nutrient-label">Kcal</span>
			<span class="nutrient-value">{calories}</span>
		</div>
		<div class="nutrient">
			<span class="nutrient-label">Proteínas</span>
			<span class="nutrient-value">{proteins} g</span>
		</div>
		<div class="nutrient">
			<span class="nutrient-label">Hidratos</span>
			<span class="nutrient-value">{carbs} g</span>
		</div>
		<div class="nutrient">
			<span class="nutrient-label">Grasas</span>
			<span class="nutrient-value">{fat} g</span>
		</div>
	</div>

	<!-- Botones de acción -->
	<div class="food-card__actions">
		<button type="button" on:click={onEdit} class="btn-icon" aria-label="Editar alimento" style="width: 2rem; height: 2rem;padding:0rem">
			<Edit style="width: 1rem; height: 1rem;" />
		</button>

		<button type="button" on:click={onDelete} class="btn-icon-warning" aria-label="Eliminar alimento" style="width: 2rem; height: 2rem;padding:0rem">
			<Trash style="width: 1rem; height: 1rem;" />
		</button>
	</div>
</div>

<style>
	.food-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 3rem;
        width: 100%;
	}

	.food-card__main {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 180px;
	}

	.food-card__icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
	}

	.food-card__name {
		font-size: 1rem;
		font-weight: 600;
	}

	.food-card__nutrients {
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

	.food-card__actions {
		display: flex;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.food-card {
			flex-direction: column;
			align-items: flex-start;
            gap: 1rem;
		}

		.food-card__main {
			width: 100%;
			gap: 0.5rem;
		}

		.food-card__icon {
			width: 2rem;
			height: 2rem;
			font-size: 1rem;
		}

		.food-card__nutrients {
			justify-content: space-between;
			width: 100%;
			margin-top: 0.5rem;
            gap: 0.5rem;
		}

		.food-card__actions {
			margin-top: 0.5rem;
			width: 100%;
			justify-content: flex-end;
		}

        .nutrient-value{
            font-size: 1rem;
        }
	}
</style>
