<script lang="ts">
	// 📦 Importación de componentes reutilizables
	import DinerCard from '$components/diner/DinerCard.svelte';
	import DinerForm from '$components/diner/DinerForm.svelte';
	import Modal from '$components/Modal.svelte';
	import HeaderActions from '$components/HeaderActions.svelte';
	import CardList from '$components/CardList.svelte';

	// 🔧 Icono
	import { Plus } from 'lucide-svelte';

	// 📡 API del módulo diners
	import { createDiner, updateDiner, deleteDiner } from '$modules/diners/api';
	import type { Diner } from '$modules/diners/types';
	import type { DinerFormData } from '$modules/diners/formSchema';

	import { Timestamp } from 'firebase/firestore';

	// 🧾 Datos cargados desde +page.ts
	export let data: { diners: Diner[] };

	let diners = [...data.diners];

	// 🎛️ Control de modal y edición
	let showModal = false;
	let isEditMode = false;
	let selectedDiner: Diner | null = null;
	let newCreatedId: string | null = null;

	// 🔍 Búsqueda y ordenación (puedes ampliar)
	let searchTerm = '';
	let sortOption = 'name-asc';

	// 🔄 Lista filtrada y ordenada
	$: filteredDiners = diners
		.filter((d) =>
			d.name
				.toLowerCase()
				.normalize('NFD')
				.replace(/\p{Diacritic}/gu, '')
				.includes(
					searchTerm
						.toLowerCase()
						.normalize('NFD')
						.replace(/\p{Diacritic}/gu, '')
				)
		)
		.sort((a, b) => {
			if (newCreatedId) return 0; // No ordenar si acabamos de crear
			switch (sortOption) {
				case 'name-asc':
					return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
				// ...
				default:
					return 0;
			}
		});

	// ✅ Crear comensal
	async function handleCreateDiner(event: CustomEvent<DinerFormData>) {
		const formData = event.detail;

		const id = await createDiner(formData);

		const newDiner: Diner = {
			id,
			...formData,
			createdAt: Timestamp.fromDate(new Date()),
			updatedAt: Timestamp.fromDate(new Date())
		};

		newCreatedId = newDiner.id;
		diners = [newDiner, ...diners];
		showModal = false;

		setTimeout(() => {
			newCreatedId = null;
		}, 2000);
	}

	// 📝 Editar comensal
	async function handleUpdateDiner(event: CustomEvent<DinerFormData>) {
		if (!selectedDiner?.id) return;
		const dinerId = selectedDiner.id;
		const formData = event.detail;

		await updateDiner(dinerId, {
			...formData,
			updatedAt: Timestamp.fromDate(new Date())
		});

		diners = diners.map((d) =>
			d.id === dinerId ? { ...d, ...formData, updatedAt: Timestamp.fromDate(new Date()) } : d
		);

		showModal = false;
		isEditMode = false;
		selectedDiner = null;
	}

	// ❌ Eliminar comensal
	async function handleDeleteDiner(dinerId: string) {
		const confirmed = confirm('¿Estás seguro de que quieres eliminar este comensal?');
		if (!confirmed) return;
		await deleteDiner(dinerId);
		diners = diners.filter((d) => d.id !== dinerId);
	}

	// ✏️ Abrir modal en modo edición
	function openEditModal(diner: Diner) {
		showModal = true;
		isEditMode = true;
		selectedDiner = diner;
	}
</script>

<!-- 🔼 Título + botón de creación -->
<HeaderActions title="Comensales" maxWidth="700px">
	<button class="btn-icon" on:click={() => (showModal = true)}>
		<Plus />
		<span>Nuevo comensal</span>
	</button>
</HeaderActions>

<!-- 🔍 (Opcional) Aquí puedes añadir FiltersRow si deseas buscar u ordenar -->

<!-- 🧾 Listado visual -->
<div class="scroll-area dynamic" style="--scroll-offset: 13rem; max-width: 700px;">
	<CardList maxWidth="700px">
		{#each filteredDiners as diner (diner.id)}
			<DinerCard
				name={diner.name ?? ''}
				caloriesObjective={diner.caloriesObjective}
				proteinsObjective={diner.proteinsObjective}
				carbsObjective={diner.carbsObjective}
				fatObjective={diner.fatObjective}
				isNew={diner.id === newCreatedId}
				onEdit={() => openEditModal(diner)}
				onDelete={() => diner.id && handleDeleteDiner(diner.id)}
			/>
		{/each}
	</CardList>
</div>

<!-- 🧮 Modal de creación/edición -->
{#if showModal}
	<Modal
		onClose={() => {
			showModal = false;
			isEditMode = false;
			selectedDiner = null;
		}}
		title={isEditMode ? 'Editar comensal' : 'Nuevo comensal'}
		maxWidth="700px"
	>
		<DinerForm
			initialData={selectedDiner ?? {
				name: '',
				caloriesObjective: '' as unknown as number,
				proteinsObjective: '' as unknown as number,
				carbsObjective: '' as unknown as number,
				fatObjective: '' as unknown as number,
				allergies: {
					foods: [],
					categories: []
				}
			}}
			{isEditMode}
			on:submit={isEditMode ? handleUpdateDiner : handleCreateDiner}
		/>
	</Modal>
{/if}

<style>
	@media (max-width: 768px) {
		.scroll-area.dynamic {
			padding-bottom: 8rem;
		}
	}
</style>
