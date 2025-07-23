import { z } from 'zod';
import { ProductColor } from '@/types';

export const productDetailsSchema = z.object({
  productSize: z.number({
    required_error: 'Please select a size',
  }),
  productColor: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
  } as z.ZodRawShape, {
    required_error: 'Please select a color',
  }) satisfies z.ZodType<ProductColor>,
});

export type ProductDetailsInput = z.infer<typeof productDetailsSchema>; 