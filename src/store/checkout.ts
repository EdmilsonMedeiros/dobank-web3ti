import { atom } from 'jotai';

// Define types for our addresses
interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  company?: string;
}

// Initialize atoms with default values
export const billingAddressAtom = atom<Address | null>(null);
export const shippingAddressAtom = atom<Address | null>(null);
export const orderNoteAtom = atom<string>(''); 