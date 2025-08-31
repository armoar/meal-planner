<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	export let value: string | null = null; // lunes seleccionado 'YYYY-MM-DD' o null
	export let disabledStarts: string[] | Set<string> = [];
	export let min: string | null = null; // lunes mínimo 'YYYY-MM-DD'
	export let max: string | null = null; // lunes máximo 'YYYY-MM-DD'
	export let locale: string = 'es-ES';

	const dispatch = createEventDispatcher();

	// Helpers UTC
	function toUTC(y: number, m: number, d: number) {
		return new Date(Date.UTC(y, m, d));
	}
	function addDaysUTC(date: Date, days: number) {
		const c = new Date(date.getTime());
		c.setUTCDate(c.getUTCDate() + days);
		return c;
	}
	function formatYMDUTC(date: Date) {
		const y = date.getUTCFullYear();
		const m = String(date.getUTCMonth() + 1).padStart(2, '0');
		const d = String(date.getUTCDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}
	function parseYMDToUTC(ymd: string) {
		const [y, m, d] = ymd.split('-').map(Number);
		return toUTC(y, m - 1, d);
	}
	function getMondayUTC(date: Date) {
		const dow = date.getUTCDay(); // 0 dom 1 lun
		const diff = (dow + 6) % 7; // dias desde lunes
		return addDaysUTC(date, -diff);
	}
	function getSundayFromMondayUTC(monday: Date) {
		return addDaysUTC(monday, 6);
	}

	// Normaliza semanas deshabilitadas a Set
	let disabledSet = new Set<string>();
	$: disabledSet = Array.isArray(disabledStarts) ? new Set(disabledStarts) : disabledStarts;

	// Vista del calendario
	let viewYear: number;
	let viewMonth: number; // 0..11

	function setViewFromValue() {
		const d = value ? parseYMDToUTC(value) : new Date();
		viewYear = d.getUTCFullYear();
		viewMonth = d.getUTCMonth();
	}

	onMount(() => {
		setViewFromValue();
		lastValue = value ?? null;
	});

	// Recentrar solo cuando cambie realmente value
	let lastValue: string | null = null;
	$: if (value !== lastValue && value) {
		const d = parseYMDToUTC(value);
		viewYear = d.getUTCFullYear();
		viewMonth = d.getUTCMonth();
		lastValue = value;
	}

	function monthLabel(y: number, m: number) {
		const d = new Date(Date.UTC(y, m, 1));
		const month = d.toLocaleString(locale, { month: 'long', timeZone: 'UTC' });
		const cap = month.charAt(0).toUpperCase() + month.slice(1);
		return `${cap} ${d.getUTCFullYear()}`;
	}

	function getGridStart(y: number, m: number) {
		const first = toUTC(y, m, 1);
		const dow = first.getUTCDay(); // 0 dom 1 lun
		const diffToMonday = dow === 0 ? -6 : 1 - dow;
		return addDaysUTC(first, diffToMonday);
	}

	// Recalcular celdas cuando cambian dependencias
	$: cells = buildCells(value, viewYear, viewMonth, disabledSet, min, max);

	function buildCells(
		valueArg: string | null,
		viewYearArg: number,
		viewMonthArg: number,
		disabledSetArg: Set<string>,
		minArg: string | null,
		maxArg: string | null
	) {
		const start = getGridStart(viewYearArg, viewMonthArg);

		const parsed = valueArg ? parseYMDToUTC(valueArg) : null;
		const selectedMonday = parsed ?? getMondayUTC(new Date());
		const selectedSunday = getSundayFromMondayUTC(selectedMonday);
		const selectedMondayYmd = formatYMDUTC(selectedMonday);

		const cells: {
			date: Date;
			ymd: string;
			isOutside: boolean;
			isToday: boolean;
			isInSelectedWeek: boolean;
			isSelectedStart: boolean;
			isDisabled: boolean;
		}[] = [];

		for (let i = 0; i < 42; i++) {
			const date = addDaysUTC(start, i);
			const ymd = formatYMDUTC(date);
			const isOutside = date.getUTCMonth() !== viewMonthArg;

			const today = new Date();
			const todayUTC = toUTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
			const isToday = ymd === formatYMDUTC(todayUTC);

			const mondayOfCell = getMondayUTC(date);
			const mondayYmd = formatYMDUTC(mondayOfCell);

			const isInSelectedWeek =
				date.getTime() >= selectedMonday.getTime() && date.getTime() <= selectedSunday.getTime();

			const isSelectedStart = ymd === selectedMondayYmd;

			const inRangeMondayLocal = (mondayYmdLocal: string) => {
				if (minArg && mondayYmdLocal < minArg) return false;
				if (maxArg && mondayYmdLocal > maxArg) return false;
				return true;
			};
			const isDisabled = disabledSetArg.has(mondayYmd) || !inRangeMondayLocal(mondayYmd);

			cells.push({
				date,
				ymd,
				isOutside,
				isToday,
				isInSelectedWeek,
				isSelectedStart,
				isDisabled
			});
		}
		return cells;
	}

	function selectByAnyDay(day: Date) {
		const monday = getMondayUTC(day);
		const mondayYmd = formatYMDUTC(monday);
		// min max se aplican en el grid y en disabledSet, no es necesario repetir aqui
		if (disabledSet.has(mondayYmd)) return;

		const sunday = getSundayFromMondayUTC(monday);
		value = mondayYmd;
		dispatch('change', { start: mondayYmd, end: formatYMDUTC(sunday) });
	}

	function prevMonth() {
		viewMonth--;
		if (viewMonth < 0) {
			viewMonth = 11;
			viewYear--;
		}
	}
	function nextMonth() {
		viewMonth++;
		if (viewMonth > 11) {
			viewMonth = 0;
			viewYear++;
		}
	}
</script>

<div class="calendar">
	<div class="calendar__header">
		<button type="button" class="btn-text" on:click={prevMonth} aria-label="Mes anterior">
			<ChevronLeft />
		</button>
		<div class="calendar__month-label">{monthLabel(viewYear, viewMonth)}</div>
		<button type="button" class="btn-text" on:click={nextMonth} aria-label="Mes siguiente">
			<ChevronRight />
		</button>
	</div>

	<div class="calendar__weekdays">
		{#each ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as wd}
			<div class="calendar__weekday">{wd}</div>
		{/each}
	</div>

	<div class="calendar__grid" role="grid" aria-label="Selector de semana">
		{#each cells as c (c.ymd)}
			<button
				type="button"
				class="calendar__cell
            {c.isOutside ? 'is-outside' : ''}
            {c.isToday ? 'is-today' : ''}
            {c.isInSelectedWeek ? 'is-in-week' : ''}
            {c.isSelectedStart ? 'is-selected-start' : ''}
            {c.isDisabled ? 'is-disabled' : ''}"
				aria-disabled={c.isDisabled}
				aria-selected={c.isSelectedStart}
				on:click={() => !c.isDisabled && selectByAnyDay(c.date)}
				title={c.isDisabled ? 'Semana ya ocupada' : ''}
			>
				{c.date.getUTCDate()}
			</button>
		{/each}
	</div>
</div>

<style>
	.calendar {
		display: grid;
		gap: 0.5rem;
	}
	.calendar__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--color-text);
	}
	.calendar__month-label {
		font-weight: 600;
	}
	.calendar__weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.25rem;
		color: var(--color-muted);
		font-size: 0.9rem;
	}
	.calendar__weekday {
		text-align: center;
	}
	.calendar__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.25rem;
	}

	.calendar__cell {
		border: 1px solid var(--color-surface-700);
		background: white;
		color: var(--color-text);
		border-radius: var(--radius-sm);
		height: 2.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.1s ease,
			box-shadow 0.1s ease,
			background 0.1s ease;
	}
	.calendar__cell:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}
	.calendar__cell.is-outside {
		opacity: 0.5;
	}

	.calendar__cell.is-in-week {
		background: color-mix(in srgb, var(--color-primary-500) 18%, white);
	}
	.calendar__cell.is-selected-start {
		background-color: var(--color-primary-500);
		font-weight: 700;
	}
	.calendar__cell.is-today:not(.is-in-week) {
		border: 2px solid var(--color-primary-950);
	}
	.calendar__cell.is-disabled {
		opacity: 0.45;
		pointer-events: none;
		background: var(--color-surface-500);
	}
</style>
