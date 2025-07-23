import { CreateOrderInput } from '@/validators/create-order.schema';

export function defaultValues(order?: CreateOrderInput) {
  return {
    billingAddress: {
      firstName: order?.billingAddress?.firstName ?? '',
      lastName: order?.billingAddress?.lastName ?? '',
      email: order?.billingAddress?.email ?? '',
      phone: order?.billingAddress?.phone ?? '',
      address: order?.billingAddress?.address ?? '',
      country: order?.billingAddress?.country ?? '',
      state: order?.billingAddress?.state ?? '',
      city: order?.billingAddress?.city ?? '',
      zip: order?.billingAddress?.zip ?? '',
      company: order?.billingAddress?.company ?? '',
    },
    sameShippingAddress: order?.sameShippingAddress ?? true,
    shippingAddress: {
      firstName: order?.shippingAddress?.firstName ?? '',
      lastName: order?.shippingAddress?.lastName ?? '',
      email: order?.shippingAddress?.email ?? '',
      phone: order?.shippingAddress?.phone ?? '',
      address: order?.shippingAddress?.address ?? '',
      country: order?.shippingAddress?.country ?? '',
      state: order?.shippingAddress?.state ?? '',
      city: order?.shippingAddress?.city ?? '',
      zip: order?.shippingAddress?.zip ?? '',
      company: order?.shippingAddress?.company ?? '',
    },
    note: order?.note ?? '',
    paymentMethod: order?.paymentMethod ?? '',
    shippingMethod: order?.shippingMethod ?? '',
  };
}

export const orderData = {
  billingAddress: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    address: 'Mirpur Road No #10',
    country: 'United States',
    state: 'New York',
    city: 'New York City',
    zip: '10001',
    company: 'Example Corp',
  },
  sameShippingAddress: true,
  shippingAddress: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    address: 'Mirpur Road No #10',
    country: 'United States',
    state: 'New York',
    city: 'New York City',
    zip: '10001',
    company: 'Example Corp',
  },
  note: '',
  paymentMethod: 'PayPal',
  shippingMethod: 'USPS',
};
