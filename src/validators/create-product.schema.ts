import { z } from 'zod';

const customFieldSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const locationShippingSchema = z.object({
  name: z.string(),
  shippingCharge: z.string(),
});

const productVariantSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  sku: z.string().min(1, 'SKU is required'),
  type: z.string().min(1, 'Type is required'),
  categories: z.string().min(1, 'Categories are required'),
  description: z.string().optional(),
  price: z.number().optional(),
  costPrice: z.number().optional(),
  retailPrice: z.number().optional(),
  salePrice: z.number().optional(),
  inventoryTracking: z.string().optional(),
  currentStock: z.string().optional(),
  lowStock: z.string().optional(),
  productAvailability: z.string().optional(),
  productImages: z.any().optional(),
  tradeNumber: z.string().optional(),
  manufacturerNumber: z.string().optional(),
  brand: z.string().optional(),
  upcEan: z.string().optional(),
  customFields: z.array(customFieldSchema).optional(),
  freeShipping: z.boolean().optional(),
  shippingPrice: z.number().optional(),
  locationBasedShipping: z.boolean().optional(),
  locationShipping: z.array(locationShippingSchema).optional(),
  pageTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  productUrl: z.string().optional(),
  isPurchaseSpecifyDate: z.boolean().optional(),
  isLimitDate: z.boolean().optional(),
  dateFieldName: z.string().optional(),
  productVariants: z.array(productVariantSchema).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateProductInput = z.infer<typeof productFormSchema>; 