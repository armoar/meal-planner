import { z } from 'zod';
import type { RecipeIngredient } from './types';

// Esquema Zod para validar ingredientes (solo los campos necesarios)
const ingredientSchema = z.object({
	foodId: z.string().min(1, 'Debes seleccionar un alimento'),
	quantity: z.number().min(0.1, 'La cantidad debe ser mayor a 0'),
	unit: z.string().min(1, 'Selecciona una unidad')
});

export const recipeFormSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	servings: z.number().min(1, 'Debe haber al menos 1 ración'),
	ingredients: z.array(ingredientSchema).min(1, 'Debes añadir al menos un ingrediente'),
	totalCalories: z.number().min(0),
	totalProteins: z.number().min(0),
	totalCarbs: z.number().min(0),
	totalFat: z.number().min(0)
});

// Tipo final del formulario: igual que el schema, pero permitimos extras en ingredientes
export type RecipeFormData = Omit<z.infer<typeof recipeFormSchema>, 'ingredients'> & {
	ingredients: RecipeIngredient[];
};
