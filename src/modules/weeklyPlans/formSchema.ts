// src/modules/weeklyPlans/formSchema.ts
import { z } from 'zod';

// Esquema para validar los datos de un comensal dentro de un Meal
const dinerMealSchema = z.object({
	dinerId: z.string().min(1, { message: 'El ID del comensal es obligatorio' }),
	quantity: z.coerce.number().nonnegative({ message: 'La cantidad debe ser un número igual o mayor a 0' }),
	excluded: z.boolean()
});

// Esquema para validar los datos de un Meal
export const mealFormSchema = z.object({
	dailyPlanId: z.string().min(1, { message: 'El ID del plan diario es obligatorio' }),
	mealTypeId: z.string().min(1, { message: 'El tipo de comida es obligatorio' }),
	foodId: z.string().optional(), // Opcional si es una receta
	recipeId: z.string().optional(), // Opcional si es un alimento
	quantity: z.coerce.number().nonnegative({ message: 'La cantidad debe ser un número igual o mayor a 0' }),
	unitId: z.string().optional(), // Opcional, aplica a Foods con unidad
	diners: z.array(dinerMealSchema).min(1, { message: 'Debe haber al menos un comensal asociado a la comida' }),
	// Campos denormalizados (no se validan en el formulario, se generan en la API)
	name: z.string().min(1, { message: 'El nombre es obligatorio' }),
	calories: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	proteins: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	carbs: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	fat: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	// Campos adicionales para Recetas
	recipeMode: z.enum(['portions', 'totalWeight', 'custom']).optional() // Modo de reparto de receta
}).refine(data => data.foodId || data.recipeId, {
    message: "Debe especificar un alimento o una receta",
    path: ["foodId"] // O recipeId, la ruta puede ser cualquiera de los dos
});

// Esquema para validar los datos de un WeeklyPlan al momento de materializarlo
export const weeklyPlanFormSchema = z.object({
    startDate: z.string().regex(/^\d{YYYY}-\d{MM}-\d{DD}$/, { message: 'Formato de fecha incorrecto (YYYY-MM-DD)' })
        .refine(dateString => {
            // Validación adicional: asegurar que startDate es lunes
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.getDay() === 1; // 1 representa el lunes
        }, { message: 'La fecha de inicio debe ser un lunes' }),
    endDate: z.string().regex(/^\d{YYYY}-\d{MM}-\d{DD}$/, { message: 'Formato de fecha incorrecto (YYYY-MM-DD)' }),
    diners: z.array(z.string().min(1, { message: 'El ID del comensal es obligatorio' })).min(1, { message: 'Debe haber al menos un comensal incluido en la semana' }),
});


export type MealFormData = z.infer<typeof mealFormSchema>;
export type WeeklyPlanFormData = z.infer<typeof weeklyPlanFormSchema>;
