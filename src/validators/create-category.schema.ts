import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  parentCategory: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  images: z.any().optional(), // Você pode refinar esta validação conforme necessário
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>; 