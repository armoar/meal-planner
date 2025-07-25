import { z } from 'zod';

export const categoryFormSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio'),
	icon: z
		.string()
		.min(1, 'El icono es obligatorio')
		.max(2, 'Solo se permite un emoji')
		.refine(
			(val) => /\p{Extended_Pictographic}/u.test(val),
			{ message: 'Debe ser un emoji válido' }
		),
	color: z
		.string()
		.regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Debe ser un color HEX válido'),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
