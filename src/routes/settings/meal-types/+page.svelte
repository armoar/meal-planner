<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '$components/Modal.svelte';
	import { Plus, Pencil, Trash2 } from 'lucide-svelte';

	import MealTypeForm from '$components/MealTypeForm.svelte';
	import MealTypeCard from '$components/MealTypeCard.svelte';

	import {
		getProtectedMealTypeIds,
		createMealType,
		updateMealType,
		deleteMealType,
		getAllMealTypes
	} from '$modules/mealTypes/api';
	import type { MealType } from '$modules/mealTypes/types';
	import type { MealTypeFormData } from '$modules/mealTypes/formSchema';
	import HeaderActions from '$components/HeaderActions.svelte';
	import CardList from '$components/CardList.svelte';

	export let data: { mealTypes: MealType[] };

	const MAX_MEAL_TYPES = 5;

	let mealTypes: MealType[] = [];
	let selectedMealType: MealType | null = null;
	let showModal = false;
	let isEditMode = false;

	let protectedIds: string[] = [];

	onMount(() => {
		mealTypes = data.mealTypes;
		protectedIds = getProtectedMealTypeIds(); // justo después de cargar
	});

	function openCreateModal() {
		selectedMealType = null;
		showModal = true;
		isEditMode = false;
	}

	function openEditModal(mealType: MealType) {
		selectedMealType = mealType;
		showModal = true;
		isEditMode = true;
	}

	async function handleCreate(event: CustomEvent<MealTypeFormData>) {
		const formData = event.detail;

		if (mealTypes.length >= MAX_MEAL_TYPES) {
			alert(`No puedes crear más de ${MAX_MEAL_TYPES} tipos de comida.`);
			return;
		}

		await createMealType(formData.name, formData.order);
		mealTypes = (await getAllMealTypes()).sort((a, b) => a.order - b.order);
		showModal = false;
	}

	async function handleUpdate(event: CustomEvent<MealTypeFormData>) {
		if (!selectedMealType?.id) return;

		const formData = event.detail;
		const id = selectedMealType.id;

		await updateMealType(id, formData);

		mealTypes = mealTypes
			.map((m) => (m.id === id ? { ...m, ...formData, updatedAt: new Date() as any } : m))
			.sort((a, b) => a.order - b.order);

		showModal = false;
	}

	async function handleDelete(mealType: MealType) {
		if (protectedIds.includes(mealType.id)) return;
		await deleteMealType(mealType.id);
		mealTypes = mealTypes.filter((m) => m.id !== mealType.id);
	}
</script>

<HeaderActions title="Comidas del día" maxWidth="600px">
	<!--
	<button class="btn-icon" on:click={openCreateModal}>
		<Plus />
		<span>Nueva comida del día</span>
	</button>
-->
</HeaderActions>

<div class="scroll-area dynamic" style="--scroll-offset: 10rem; max-width: 600px;">
	<CardList>
		{#each mealTypes as mealType (mealType.id)}
			<MealTypeCard
				name={mealType.name}
				order={mealType.order}
				on:edit={() => openEditModal(mealType)}
	on:delete={() => handleDelete(mealType)}
			/>
		{/each}
	</CardList>
</div>

{#if showModal}
		<Modal
			onClose={() => {
				showModal = false;
				isEditMode = false;
				selectedMealType = null;
			}}
			title={isEditMode ? 'Editar comida del día' : 'Nueva comida del día'}
		>
			<MealTypeForm
				initialData={selectedMealType ?? { name: '', order: 1 }}
				{isEditMode}
				on:submit={isEditMode ? handleUpdate: handleCreate}
			/>
		</Modal>
{/if}
