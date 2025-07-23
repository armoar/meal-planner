// Zod schema for form validation (if needed)
import { z } from 'zod';

export const unitFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  symbol: z.string().min(1, 'El símbolo es obligatorio'),
  conversionFactor: z.number().nonnegative('Debe ser un número positivo')
});

export type UnitFormData = z.infer<typeof unitFormSchema>;
