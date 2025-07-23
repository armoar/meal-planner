<script lang="ts">
	import UnitCard from '$components/UnitCard.svelte';
	import CardList from '$components/CardList.svelte';
	import HeaderActions from '$components/HeaderActions.svelte';
	import UnitForm from '$components/UnitForm.svelte';
	import Modal from '$components/Modal.svelte';
	import { Plus } from 'lucide-svelte';
	import { createUnit } from '$modules/units/api';
	import type { Unit } from '$modules/units/types';
	import type { UnitFormData } from '$modules/units/formSchema';

	export let data: { units: Unit[] };

	let showModal = false;
	let units = [...data.units]; // Estado local para el listado

	async function handleCreateUnit(event: CustomEvent<UnitFormData>) {
		const formData = event.detail;
		await createUnit(formData);
		showModal = false;

		// Actualizamos el estado local (alternativa simple al re-load)
		units = [
			...units,
			{
				...formData,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
	}
</script>

<div class="flex h-screen flex-col" style="gap: 1rem;">
	<HeaderActions title="Unidades">
		<button class="btn-icon" on:click={() => (showModal = true)}>
			<Plus style="width: 1rem; height: 1rem;" />
			<span>Nueva unidad</span>
		</button>
	</HeaderActions>

	<CardList>
		{#each units as unit (unit.id)}
			<UnitCard
				name={unit.name}
				symbol={unit.symbol}
				conversionFactor={unit.conversionFactor}
				onEdit={() => console.log('Editar unidad:', unit.id)}
				onDelete={() => console.log('Eliminar unidad:', unit.id)}
			/>
		{/each}
	</CardList>
	{#if showModal}
		<Modal onClose={() => (showModal = false)}>
			<UnitForm on:submit={handleCreateUnit} />
		</Modal>
	{/if}
</div>
