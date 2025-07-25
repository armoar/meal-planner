import { z } from 'zod';

// MAX NÚMERO DE COMIDAS AL DÍA
export const MAX_MEAL_TYPES = 5;

export const mealTypeFormSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es obligatorio')
		.max(40, 'El nombre no puede tener más de 40 caracteres'),
	order: z
		.number()
		.min(1, 'El orden mínimo es 1')
		.max(MAX_MEAL_TYPES, `El orden no puede ser mayor que ${MAX_MEAL_TYPES}`)
});

export type MealTypeFormData = z.infer<typeof mealTypeFormSchema>;
