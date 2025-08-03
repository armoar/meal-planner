import { z } from 'zod';

export const dinerFormSchema = z.object({
	name: z.string().min(1, { message: 'El nombre es obligatorio' }),
	caloriesObjective: z
		.coerce
		.number()
		.nonnegative({ message: 'Debe ser un número igual o mayor a 0' })
		.optional(),
	proteinsObjective: z
		.coerce
		.number()
		.nonnegative({ message: 'Debe ser un número igual o mayor a 0' })
		.optional(),
	carbsObjective: z
		.coerce
		.number()
		.nonnegative({ message: 'Debe ser un número igual o mayor a 0' })
		.optional(),
	fatObjective: z
		.coerce
		.number()
		.nonnegative({ message: 'Debe ser un número igual o mayor a 0' })
		.optional(),
	allergies: z
		.object({
			foods: z.array(z.string()),
			categories: z.array(z.string())
		})
		.optional()
});

export type DinerFormData = z.infer<typeof dinerFormSchema>;
