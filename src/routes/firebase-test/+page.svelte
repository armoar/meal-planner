<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import type { Unit } from '$modules/units/types';

  let units: Unit[] = [];
  let error = '';

  onMount(async () => {
  try {
    const snapshot = await getDocs(collection(db, 'units'));
    console.log('📦 Documentos encontrados:', snapshot.docs.length);

    units = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('🔍 Documento:', data);
      return {
        id: doc.id,
        ...data
      };
    }) as Unit[];
  } catch (err) {
    error = 'Error al cargar los datos de Firebase';
    console.error('❌ Error:', err);
  }
});
</script>

<h1 class="text-xl font-bold mb-4">Prueba de conexión con Firebase</h1>

{#if error}
  <p class="text-red-500">{error}</p>
{:else if units.length}
  <h2 class="text-lg font-semibold">Unidades:</h2>
  <ul>
    {#each units as unit}
      <li>{unit.name} ({unit.abbreviation})</li>
    {/each}
  </ul>
{:else}
  <p>Cargando o no hay unidades aún…</p>
{/if}
