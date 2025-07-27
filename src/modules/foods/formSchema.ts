import { z } from 'zod';

export const foodFormSchema = z.object({
	name: z.string().min(1, { message: 'El nombre es obligatorio' }),
	categoryId: z.string().min(1, { message: 'La categoría es obligatoria' }),
	categoryName: z.string().min(1, { message: 'El nombre de la categoría es obligatorio' }),
	categoryIcon: z.string().min(1, { message: 'El icono es obligatorio' }),
	categoryColor: z.string().min(1, { message: 'El color es obligatorio' }),
	calories: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	proteins: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	carbs: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' }),
	fat: z.coerce.number().nonnegative({ message: 'Debe ser un número igual o mayor a 0' })
});

export type FoodFormData = z.infer<typeof foodFormSchema>;
