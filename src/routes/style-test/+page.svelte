<script lang="ts">
	import { ArrowLeft, Cross, Save, Trash2, X } from 'lucide-svelte';
</script>

<div class="card">
	<h1>¡Bienvenido a Meal Planner!</h1>
	<p>Esta es una prueba de los estilos base.</p>
	<input class="input" placeholder="Nombre de usuario" />
	<div class="card flex flex-col gap-4">
		<h1>Botones</h1>

		<div class="flex gap-2">
			<button class="btn">Primario</button>
			<button class="btn-secondary">Secundario</button>
			<button class="btn-warning"> Eliminar </button>
			<button class="btn-text">Solo texto</button>
		</div>
		<br />
		<div class="flex gap-2">
			<button class="btn-icon">
				<ArrowLeft size="18" />
				Volver
			</button>
			<button class="btn-icon-secondary">
				<Save size="18" />
				Guardar
			</button>
			<button class="btn-icon-warning">
				<Trash2 size="18" />
				Eliminar
			</button>
			<button class="btn-text">
				<X size="18" />
				Quitar
			</button>
		</div>
	</div>

	<div class="alert-info mt-4">ℹ️ Información importante</div>
	<div class="alert-warning mt-4">⚠️ Atención, revisa los datos</div>
	<div class="alert-error mt-4">❌ Error al guardar</div>
</div>
