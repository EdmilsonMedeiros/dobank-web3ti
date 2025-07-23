import { CartItem } from '@/types';

export function addItemWithQuantity(
  items: CartItem[],
  item: CartItem,
  quantity: number
): CartItem[] {
  const existingItemIndex = items.findIndex(
    (existingItem) => existingItem.id === item.id
  );

  if (existingItemIndex > -1) {
    const newItems = [...items];
    newItems[existingItemIndex].quantity += quantity;
    return newItems;
  }

  return [...items, { ...item, quantity }];
}

export function removeItemOrQuantity(
  items: CartItem[],
  id: number,
  quantity = 1
): CartItem[] {
  return items.reduce((acc: CartItem[], item) => {
    if (item.id === id) {
      const newQuantity = item.quantity - quantity;
      return newQuantity > 0
        ? [...acc, { ...item, quantity: newQuantity }]
        : acc;
    }
    return [...acc, item];
  }, []);
}

export function removeItem(items: CartItem[], id: number): CartItem[] {
  return items.filter((item) => item.id !== id);
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
} 