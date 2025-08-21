import { z } from 'zod';

export const mealFormSchema = z.object({
  dailyPlanId: z.string().min(1, 'Falta el día'),
  mealTypeId: z.string().min(1, 'Selecciona un tipo de comida'),
  foodId: z.string().optional(),
  recipeId: z.string().optional(),

  quantity: z.coerce.number().positive({ message: 'La cantidad debe ser mayor que cero' }),
  unitId: z.string().optional(),

  name: z.string().min(1, 'Falta el nombre'),

  calories: z.coerce.number().nonnegative({ message: 'Debe ser ≥ 0' }),
  proteins: z.coerce.number().nonnegative({ message: 'Debe ser ≥ 0' }),
  carbs: z.coerce.number().nonnegative({ message: 'Debe ser ≥ 0' }),
  fat: z.coerce.number().nonnegative({ message: 'Debe ser ≥ 0' }),

  recipeMode: z.enum(['portions', 'totalWeight', 'custom']).optional(),

  diners: z.array(
    z.object({
      dinerId: z.string().min(1),
      quantity: z.coerce.number().nonnegative({ message: '≥ 0' }),
      excluded: z.coerce.boolean().default(false)
    })
  ).optional()
});

export type MealFormData = z.infer<typeof mealFormSchema>;
