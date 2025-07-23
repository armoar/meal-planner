<script lang="ts">
	import UnitCard from '$components/UnitCard.svelte';
	import CardList from '$components/CardList.svelte';
	import HeaderActions from '$components/HeaderActions.svelte';
	import UnitForm from '$components/UnitForm.svelte';
	import Modal from '$components/Modal.svelte';
	import { Plus } from 'lucide-svelte';
	import { createUnit, updateUnit, deleteUnit } from '$modules/units/api';
	import type { Unit } from '$modules/units/types';
	import type { UnitFormData } from '$modules/units/formSchema';

	export let data: { units: Unit[] };

	let showModal = false;
	let units = [...data.units]; // Estado local para el listado
	let isEditMode = false;
	let selectedUnit: Unit | null = null;
	let newCreatedId: string | null = null;

	async function handleCreateUnit(event: CustomEvent<UnitFormData>) {
		const formData = event.detail;

		const newId = await createUnit(formData);

		const newUnit: Unit = {
			id: newId,
			...formData,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		newCreatedId = newId; // Guarda el ID

		units = [newUnit, ...units];
		showModal = false;

		// Después de 2 segundos, limpiamos
		setTimeout(() => {
			newCreatedId = null;
		}, 2000);
	}

	async function handleUpdateUnit(event: CustomEvent<UnitFormData>) {
		if (!selectedUnit?.id) return;

		const unitId = selectedUnit.id; // ✅ ya es string, no undefined

		const formData = event.detail;

		await updateUnit(unitId, {
			...formData,
			updatedAt: new Date()
		});

		// Actualizamos el estado antes de limpiar selectedUnit
		units = units
			.map((u) => (u.id === unitId ? { ...u, ...formData, id: unitId, updatedAt: new Date() } : u))
			.sort((a, b) => a.name.localeCompare(b.name));

		// Cerramos y limpiamos
		showModal = false;
		isEditMode = false;
		selectedUnit = null;
	}

	async function handleDeleteUnit(unitId: string) {
		const confirmed = confirm('¿Estás seguro de que quieres eliminar esta unidad?');

		if (!confirmed) return;

		await deleteUnit(unitId);

		units = units.filter((u) => u.id !== unitId);
	}

	function openEditModal(unit: Unit) {
		showModal = true;
		isEditMode = true;
		selectedUnit = unit;
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
		isNew={unit.id === newCreatedId}
		onEdit={() => openEditModal(unit)}
		onDelete={() => unit.id && handleDeleteUnit(unit.id)}
	/>
	
		{/each}
	</CardList>
	{#if showModal}
		<Modal
			onClose={() => {
				showModal = false;
				isEditMode = false;
				selectedUnit = null;
			}}
		>
			<UnitForm
				initialData={selectedUnit ?? { name: '', symbol: '', conversionFactor: 1 }}
				{isEditMode}
				on:submit={isEditMode ? handleUpdateUnit : handleCreateUnit}
			/>
		</Modal>
	{/if}
</div>
