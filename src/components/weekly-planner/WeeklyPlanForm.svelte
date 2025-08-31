<script lang="ts">
	import Modal from '$components/Modal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { createWeeklyPlan } from '$modules/weeklyPlans/api';
	import type { Diner } from '$modules/diners/types';
	import WeekDatepicker from '$components/WeekDatepicker.svelte';

	export let open = false;
	export let maxWidth: string = '680px';
	export let diners: Diner[] = [];
	export let defaultStart: string | null = null;
	export let disabledWeeks: string[] = [];

	const dispatch = createEventDispatcher();

	let selectedIds: string[] = [];
	let isSubmitting = false;
	let errorMsg = '';

	$: allChecked = selectedIds.length === diners.length && diners.length > 0;

	function handleClose() {
		if (!isSubmitting) dispatch('close');
	}

	function toggleAll() {
		selectedIds = allChecked ? [] : diners.map((d) => d.id);
	}

	// Helpers UTC con blindajes
	function toUTC(y: number, m: number, d: number) {
		return new Date(Date.UTC(y, m, d));
	}
	function parseYMDToUTC(ymd?: string | null) {
		if (!ymd || ymd.length < 10) return null;
		const parts = ymd.split('-').map(Number);
		if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
		const [y, m, d] = parts;
		return toUTC(y, m - 1, d);
	}
	function formatYMDUTC(date: Date) {
		const y = date.getUTCFullYear();
		const m = String(date.getUTCMonth() + 1).padStart(2, '0');
		const d = String(date.getUTCDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}
	function formatDMY(date?: Date | null) {
		if (!date || Number.isNaN(date.getTime())) return '';
		const dd = String(date.getUTCDate()).padStart(2, '0');
		const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
		const yy = date.getUTCFullYear();
		return `${dd}/${mm}/${yy}`;
	}
	function getMondayFrom(date: Date) {
		const dow = date.getUTCDay();
		const diff = (dow + 6) % 7;
		const monday = new Date(date.getTime());
		monday.setUTCDate(date.getUTCDate() - diff);
		return monday;
	}
	function addDaysUTC(d: Date, days: number) {
		const c = new Date(d.getTime());
		c.setUTCDate(c.getUTCDate() + days);
		return c;
	}
	function isMonday(ymd?: string | null) {
		const dt = parseYMDToUTC(ymd);
		return !!dt && dt.getUTCDay() === 1;
	}
	function getSundayFromMonday(ymdMonday?: string | null): string {
		const mon = parseYMDToUTC(ymdMonday);
		if (!mon) return '';
		const sun = addDaysUTC(mon, 6);
		return formatYMDUTC(sun);
	}
	function findFirstFreeWeek(disabled: string[]): string {
		const set = new Set(disabled);
		let monday = getMondayFrom(new Date());
		let guard = 0;
		while (set.has(formatYMDUTC(monday)) && guard < 260) {
			monday = addDaysUTC(monday, 7);
			guard++;
		}
		return formatYMDUTC(monday);
	}

	// Fecha seleccionada en el modal
	let startDate: string | null = null;

	// Al abrir la modal, decidir semana inicial
	let wasOpen = false;
	$: if (open && !wasOpen) {
		const normalizedDefault = defaultStart
			? (() => {
					const d = parseYMDToUTC(defaultStart);
					return d ? formatYMDUTC(getMondayFrom(d)) : null;
				})()
			: null;

		startDate = normalizedDefault ?? findFirstFreeWeek(disabledWeeks);
		wasOpen = true;
	}
	$: if (!open && wasOpen) {
		wasOpen = false;
	}

	// Rango para hint
	$: weekStart = startDate ?? '';
	$: weekEnd = startDate ? getSundayFromMonday(startDate) : '';

	async function onSubmit(e: Event) {
		e.preventDefault();
		errorMsg = '';

		if (!startDate) {
			errorMsg = 'Selecciona una fecha de inicio.';
			return;
		}
		if (!isMonday(startDate)) {
			errorMsg = 'La fecha de inicio debe ser lunes.';
			return;
		}

		try {
			isSubmitting = true;
			const { id } = await createWeeklyPlan(startDate, selectedIds, diners);
			dispatch('created', { id, start: startDate });
		} catch (err: any) {
			console.error(err);
			errorMsg = err?.message ?? 'No se pudo crear el plan.';
		} finally {
			isSubmitting = false;
		}
	}

	$: if (!open) {
		errorMsg = '';
	}
</script>

{#if open}
	<Modal title="Crear plan semanal" onClose={handleClose} {maxWidth}>
		<form on:submit={onSubmit} class="modal__body">
			<div class="form-group">
				<label>Selecciona una semana</label>

				<WeekDatepicker bind:value={startDate} disabledStarts={disabledWeeks} />

				{#if startDate && weekEnd}
					<div class="form-hint">
						Semana del
						<strong>{formatDMY(parseYMDToUTC(weekStart))}</strong>
						→
						<strong>{formatDMY(parseYMDToUTC(weekEnd))}</strong>
					</div>
				{:else}
					<div class="form-hint">Selecciona una semana.</div>
				{/if}
			</div>

			<div class="form-group">
				<div class="form-row-spread">
					<label>Comensales incluidos</label>
					<button type="button" class="btn-text" on:click={toggleAll}>
						{allChecked ? 'Deseleccionar todos' : 'Seleccionar todos'}
					</button>
				</div>

				{#if diners.length === 0}
					<div class="muted">No hay comensales disponibles.</div>
				{:else}
					<div class="checkbox-grid">
						{#each diners as d}
							<label class="checkbox-item">
								<input type="checkbox" bind:group={selectedIds} value={d.id} />
								<span>{d.name}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			{#if errorMsg}
				<div class="alert alert-error">{errorMsg}</div>
			{/if}

			<div class="form-actions-right">
				<button type="submit" class="btn" disabled={isSubmitting} aria-busy={isSubmitting}>
					{isSubmitting ? 'Creando…' : 'Crear plan'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

<style>
	.modal__body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.form-row-spread {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}
	.form-hint {
		color: var(--color-muted);
		font-size: 0.9rem;
	}

	.checkbox-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.5rem;
		padding: 0.25rem 0;
	}
	.checkbox-item {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.form-actions-right {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}
</style>
