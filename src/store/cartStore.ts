import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Feature {
  id: string;
  name: string;
}

interface Smartwatch {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  features: Feature[];
  stock: number;
}

interface CartItem extends Smartwatch {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Smartwatch) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const useCartStore = create<CartState>()(
  // persist middleware to save and load state from localStorage
  persist(
    // devtools middleware for easier debugging with Redux DevTools
    devtools(
      (set, get) => ({
        items: [],
        addToCart: (item) => {
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex((i) => i.id === item.id);

          let newItems: CartItem[];
          if (existingItemIndex >= 0) {
            newItems = currentItems.map((i, index) =>
              index === existingItemIndex ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newItems = [...currentItems, { ...item, quantity: 1 }];
          }

          set({
            items: newItems,
            totalItems: calculateTotalItems(newItems),
            totalPrice: calculateTotalPrice(newItems),
          });
        },
        removeItem: (itemId) => {
          const currentItems = get().items;
          const newItems = currentItems.filter((i) => i.id !== itemId);
          
          set({
            items: newItems,
            totalItems: calculateTotalItems(newItems),
            totalPrice: calculateTotalPrice(newItems),
          });
        },
        updateItemQuantity: async (itemId, quantity) => {
          const currentItems = get().items;
          let newItems: CartItem[];

          if (quantity < 1) {
            newItems = currentItems.filter((i) => i.id !== itemId);
          } else {
            newItems = currentItems.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            );
          }

          set({
            items: newItems,
            totalItems: calculateTotalItems(newItems),
            totalPrice: calculateTotalPrice(newItems),
          });
          return true;
        },
        clearCart: () => {
          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
          });
        },
        get totalItems() {
          return calculateTotalItems(get().items);
        },
        get totalPrice() {
          return calculateTotalPrice(get().items);
        },
      }),
      { name: 'cart-store' }
    ),
    {
      name: 'cart-storage',
      // Não persistir o stock no localStorage, pois será sempre buscado do backend
      partialize: (state) => ({
        items: state.items.map(item => {
          const { stock, ...rest } = item;
          return rest;
        })
      }),
      // Migration function if schema changes in the future (optional)
      // migrate: (persistedState, version) => { ... },
      // version: 0,
    }
  )
); 