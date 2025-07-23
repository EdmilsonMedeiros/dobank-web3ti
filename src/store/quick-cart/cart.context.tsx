'use client';

import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { CartItem } from '@/types';
import { addItemWithQuantity, removeItemOrQuantity, removeItem, calculateTotal, calculateTotalItems } from './cart.utils';

type Action =
  | { type: 'ADD_ITEM'; item: CartItem; quantity?: number }
  | { type: 'REMOVE_ITEM'; id: number; quantity?: number }
  | { type: 'CLEAR_ITEM'; id: number };

type State = {
  items: CartItem[];
  total: number;
  totalItems: number;
};

const initialState: State = {
  items: [],
  total: 0,
  totalItems: 0,
};

export const cartReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_ITEM':
      const newItems = addItemWithQuantity(
        state.items,
        action.item,
        action.quantity ?? 1
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        totalItems: calculateTotalItems(newItems),
      };
    case 'REMOVE_ITEM':
      const items = removeItemOrQuantity(
        state.items,
        action.id,
        action.quantity ?? 1
      );
      return {
        ...state,
        items,
        total: calculateTotal(items),
        totalItems: calculateTotalItems(items),
      };
    case 'CLEAR_ITEM':
      const remainingItems = removeItem(state.items, action.id);
      return {
        ...state,
        items: remainingItems,
        total: calculateTotal(remainingItems),
        totalItems: calculateTotalItems(remainingItems),
      };
    default:
      return state;
  }
};

const CartContext = createContext<State & {
  addItemToCart: (item: CartItem, quantity: number) => void;
  removeItemFromCart: (id: number) => void;
  clearItemFromCart: (id: number) => void;
}>({
  ...initialState,
  addItemToCart: () => {},
  removeItemFromCart: () => {},
  clearItemFromCart: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItemToCart = (item: CartItem, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', item, quantity });
  };

  const removeItemFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  };

  const clearItemFromCart = (id: number) => {
    dispatch({ type: 'CLEAR_ITEM', id });
  };

  const value = useMemo(
    () => ({
      ...state,
      addItemToCart,
      removeItemFromCart,
      clearItemFromCart,
    }),
    [state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 