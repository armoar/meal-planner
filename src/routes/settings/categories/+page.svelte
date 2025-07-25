<script lang="ts">
	import CategoryCard from '$components/CategoryCard.svelte';
	import CardList from '$components/CardList.svelte';
	import HeaderActions from '$components/HeaderActions.svelte';
	import CategoryForm from '$components/CategoryForm.svelte';
	import Modal from '$components/Modal.svelte';
	import { Plus } from 'lucide-svelte';
	import { createCategory, updateCategory, deleteCategory } from '$modules/categories/api';
	import type { Category } from '$modules/categories/types';
	import type { CategoryFormData } from '$modules/categories/formSchema';
	import { Timestamp } from 'firebase/firestore';

	export let data: { categories: Category[] };

	let showModal = false;
	let categories = [...data.categories]; // Estado local para el listado
	let isEditMode = false;
	let selectedCategory: Category | null = null;
	let newCreatedId: string | null = null;

	async function handleCreateCategory(event: CustomEvent<CategoryFormData>) {
		const formData = event.detail;

		const newId = await createCategory(formData);

		const newCategory: Category = {
			id: newId,
			...formData,
			createdAt: Timestamp.fromDate(new Date()),
			updatedAt: Timestamp.fromDate(new Date())
		};

		newCreatedId = newId; // Guarda el ID

		categories = [newCategory, ...categories];
		showModal = false;

		// Después de 2 segundos, limpiamos
		setTimeout(() => {
			newCreatedId = null;
		}, 2000);
	}

	async function handleUpdateCategory(event: CustomEvent<CategoryFormData>) {
		if (!selectedCategory?.id) return;

		const categoryId = selectedCategory.id; // ✅ ya es string, no undefined

		const formData = event.detail;

		await updateCategory(categoryId, {
			...formData,
			updatedAt: Timestamp.fromDate(new Date())
		});

		// Actualizamos el estado antes de limpiar selectedCategory
		categories = categories
			.map((u) =>
				u.id === categoryId ? { ...u, ...formData, id: categoryId, updatedAt: Timestamp.fromDate(new Date()) } : u
			)
			.sort((a, b) => a.name.localeCompare(b.name));

		// Cerramos y limpiamos
		showModal = false;
		isEditMode = false;
		selectedCategory = null;
	}

	async function handleDeleteCategory(categoryId: string) {
		const confirmed = confirm('¿Estás seguro de que quieres eliminar esta Categoría?');
		if (!confirmed) return;
		await deleteCategory(categoryId);
		categories = categories.filter((u) => u.id !== categoryId);
	}

	function openEditModal(category: Category) {
		showModal = true;
		isEditMode = true;
		selectedCategory = category;
	}
</script>

<div>
	<HeaderActions title="Categorías">
		<button class="btn-icon" on:click={() => (showModal = true)}>
			<Plus />
			<span>Nueva Categoría</span>
		</button>
	</HeaderActions>

	<div class="scroll-area">
		<CardList>
			{#each categories as category (category.id)}
				<CategoryCard
					name={category.name}
					color={category.color}
					icon={category.icon}
					isNew={category.id === newCreatedId}
					onEdit={() => openEditModal(category)}
					onDelete={() => category.id && handleDeleteCategory(category.id)}
				/>
			{/each}
		</CardList>
	</div>
	{#if showModal}
		<Modal
			onClose={() => {
				showModal = false;
				isEditMode = false;
				selectedCategory = null;
			}}
			title={isEditMode ? 'Editar categoría' : 'Nueva categoría'}
		>
			<CategoryForm
				initialData={selectedCategory ?? { name: '', icon: '', color: '#949494' }}
				{isEditMode}
				on:submit={isEditMode ? handleUpdateCategory : handleCreateCategory}
			/>
		</Modal>
	{/if}
</div>
git status
