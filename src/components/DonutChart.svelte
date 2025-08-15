<script lang="ts">
	import * as echarts from 'echarts';
	import { onMount, onDestroy } from 'svelte';

	export let carbs: number = 40;
	export let proteins: number = 30;
	export let fat: number = 30;
	export let totalCalories: number = 2000;
	export let tolerancePct: number = 1;

	let chartEl: HTMLDivElement;
	let chartInstance: echarts.ECharts | null = null;

	function cssVar(name: string, fallback: string) {
		const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
		return v || fallback;
	}

	function renderChart(c: number, p: number, f: number, kcal: number) {
		if (!chartInstance) return;

		// colores
		const carbColor = cssVar('--color-carbs-500', '#4fc3f7');
		const proteinColor = cssVar('--color-proteins-500', '#81c784');
		const fatColor = cssVar('--color-fat-500', '#ffb74d');
		const errorColor = cssVar('--color-error-500', '#ef5350');
		const bgColor = getComputedStyle(document.body).backgroundColor || '#fff';

		// kcal desde macros
		const kcalFromMacros = (Number(c) || 0) * 4 + (Number(p) || 0) * 4 + (Number(f) || 0) * 9;

		const cCal = (Number(c) || 0) * 4;
		const pCal = (Number(p) || 0) * 4;
		const fCal = (Number(f) || 0) * 9;

		// % entero de desajuste
		const sumPct = (kcalFromMacros / (Number(kcal) || 1)) * 100;
		const diffPctInt = Math.round(sumPct - 100);
		const glowVisible = Math.abs(diffPctInt) >= tolerancePct;
		const glowOpacity = glowVisible ? 1 : 0;

		// --- series ---
		const mainSeries = {
			id: 'macros',
			name: 'Macronutrientes',
			type: 'pie',
			radius: ['63%', '75%'],
			padAngle: 3,
			itemStyle: {
				borderRadius: 9999,
				borderColor: '#fff',
				borderWidth: 2
			},
			zlevel: 3,
			label: { show: false },
			labelLine: { show: false },
			avoidLabelOverlap: false, // antes estaba en false
			data: [
				{ value: cCal, name: 'Hidratos', itemStyle: { color: carbColor } },
				{ value: pCal, name: 'Proteínas', itemStyle: { color: proteinColor } },
				{ value: fCal, name: 'Grasas', itemStyle: { color: fatColor } }
			]
		} as echarts.SeriesOption;

		// halo exterior (siempre existe; solo cambiamos opacity)
		const glowSeries = {
			id: 'glow',
			name: 'Glow',
			type: 'pie',
			radius: ['82%', '84%'], // fuera del donut
			silent: true,
			hoverAnimation: false,
			emphasis: { disabled: true },
			zlevel: 1,
			z: 1000,
			label: { show: false },
			labelLine: { show: false },
			tooltip: { show: false },
			itemStyle: {
				opacity: glowOpacity, // ← visibilidad sin re-crear series
				color: errorColor, // relleno muy suave
				shadowBlur: 10,
				shadowColor: errorColor,
				shadowOffsetX: 0,
				shadowOffsetY: 0
			},
			data: [{ value: 100 }]
		} as echarts.SeriesOption;

		// máscara para que el glow sea SOLO hacia fuera
		const maskSeries = {
			id: 'mask',
			name: 'Mask',
			type: 'pie',
			radius: ['75%', '82%'], // del borde del donut al inicio del glow
			silent: true,
			zlevel: 2,
			z: 1001,
			label: { show: false },
			labelLine: { show: false },
			tooltip: { show: false },
			itemStyle: {
				opacity: glowOpacity, // ← se apaga/enciende junto al glow
				color: bgColor
			},
			data: [{ value: 100 }]
		} as echarts.SeriesOption;

		const tooltipFormatter = (p: any) => `${p.name}: ${Math.round(p.percent ?? 0)}%`;

		chartInstance.setOption(
			{
				backgroundColor: 'transparent',
				tooltip: { trigger: 'item', formatter: tooltipFormatter },
				series: [mainSeries, glowSeries, maskSeries],
				graphic: [
					{
						type: 'text',
						left: 'center',
						top: 'middle',
						style: {
							text: `${Number(kcal) || 0} kcal`,
							textAlign: 'center',
							fill: '#444',
							fontSize: 18,
							fontWeight: 600
						}
					}
				],
			},
			// No usamos notMerge:true para evitar "rebotes". ECharts hará diff por id.
			{ notMerge: false, lazyUpdate: false }
		);
	}

	function resize() {
		if (chartInstance) chartInstance.resize();
	}

	onMount(() => {
		chartInstance = echarts.init(chartEl); // canvas por defecto
		renderChart(carbs, proteins, fat, totalCalories);
		window.addEventListener('resize', resize);
	});

	// Re-render when any input changes
	$: if (chartInstance) renderChart(carbs, proteins, fat, totalCalories);

	onDestroy(() => {
		window.removeEventListener('resize', resize);
		chartInstance?.dispose();
		chartInstance = null;
	});
</script>

<div bind:this={chartEl} style="width: 100%; height: 280px;"></div>
