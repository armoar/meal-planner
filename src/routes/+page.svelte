<script>
	import { goto } from '$app/navigation';
</script>

<main class="min-h-screen bg-[var(--color-surface)] flex flex-col justify-center items-center px-6 py-12 space-y-8 text-center">

	<h1 class="title text-[var(--color-primary)] text-4xl">
		🍽️ Meal Planner
	</h1>

	<p class="max-w-xl text-lg text-gray-700">
		Organiza tus comidas semanales, controla tus objetivos nutricionales y crea listas de la compra personalizadas para ti y tus comensales.
	</p>

	<div class="card max-w-2xl text-left">
		<h2 class="title text-[var(--color-secondary)] text-2xl">¿Qué puedes hacer?</h2>
		<ul class="list-disc list-inside space-y-2 text-gray-800">
			<li>Definir tus propios <strong>alimentos, unidades y categorías</strong></li>
			<li>Crear <strong>recetas personalizadas</strong> con valores nutricionales</li>
			<li>Planificar cada semana por <strong>día y tipo de comida</strong></li>
			<li>Añadir <strong>comensales</strong> con alergias u objetivos nutricionales</li>
			<li>Generar una <strong>lista de la compra</strong> agrupada por categorías</li>
		</ul>
	</div>

	<button on:click={() => goto('/firebase-test')}	class="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  	Ver MealTypes
	</button>

	<footer class="text-sm text-gray-500 mt-10">
		Meal Planner · Proyecto en desarrollo
	</footer>
</main>
