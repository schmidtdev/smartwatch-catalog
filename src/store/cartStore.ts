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

export const useCartStore = create<CartState>()(
  // persist middleware to save and load state from localStorage
  persist(
    // devtools middleware for easier debugging with Redux DevTools
    devtools(
      (set, get) => ({
        items: [],
        addToCart: (item) => {
          const existingItem = get().items.find((i) => i.id === item.id);
          if (existingItem) {
            set((state) => ({
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }));
          } else {
            set((state) => ({
              items: [...state.items, { ...item, quantity: 1 }],
            }));
          }
        },
        removeItem: (itemId) => {
          set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
        },
        updateItemQuantity: async (itemId, quantity) => {
          if (quantity < 1) {
            get().removeItem(itemId);
            return true;
          }
          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          }));
          return true;
        },
        clearCart: () => set({ items: [] }),
        get totalItems() {
          return get().items.reduce((count, item) => count + item.quantity, 0);
        },
        get totalPrice() {
          return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        },
      })
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