import { z } from 'zod';

// Address validation schema
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  company: z.string().optional(),
});

// Order form schema
export const orderFormSchema = z.object({
  billingAddress: addressSchema,
  sameShippingAddress: z.boolean().default(true),
  shippingAddress: addressSchema.optional(),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  note: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

// Export type for use in components
export type CreateOrderInput = z.infer<typeof orderFormSchema>; 