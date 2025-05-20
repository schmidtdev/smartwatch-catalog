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
  addItem: (item: Smartwatch) => Promise<boolean>;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  // persist middleware to save and load state from localStorage
  persist(
    // devtools middleware for easier debugging with Redux DevTools
    devtools(
      (set, get) => ({
        items: [],
        addItem: async (item) => {
          const existingItem = get().items.find((i) => i.id === item.id);

          // Buscar detalhes atualizados do smartwatch, incluindo estoque
          const response = await fetch(`/api/smartwatches/${item.id}`);
          if (!response.ok) {
            console.error('Erro ao buscar detalhes do smartwatch para adicionar ao carrinho', item.id);
            return false;
          }
          const productDetails: Smartwatch = await response.json();

          const currentQuantity = existingItem ? existingItem.quantity : 0;
          const newQuantity = currentQuantity + 1;

          // Validar estoque
          if (newQuantity > productDetails.stock) {
            console.warn(`Estoque insuficiente para adicionar mais do produto: ${productDetails.name}`);
            return false;
          }

          if (existingItem) {
            set((state) => ({
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQuantity, stock: productDetails.stock } : i
              ),
            }));
          } else {
            set((state) => ({
              items: [...state.items, { ...item, quantity: 1, stock: productDetails.stock }],
            }));
          }
          return true;
        },
        removeItem: (itemId) => {
          set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
        },
        updateItemQuantity: async (itemId, quantity) => {
          const existingItem = get().items.find((i) => i.id === itemId);
          if (!existingItem) return false;

          if (quantity < 1) {
            get().removeItem(itemId);
            return true;
          }

          // Buscar detalhes atualizados do smartwatch, incluindo estoque
          const response = await fetch(`/api/smartwatches/${itemId}`);
          if (!response.ok) {
            console.error('Erro ao buscar detalhes do smartwatch para atualizar quantidade', itemId);
            return false;
          }
          const productDetails: Smartwatch = await response.json();

          // Validar estoque
          if (quantity > productDetails.stock) {
            console.warn(`Estoque insuficiente para definir a quantidade para ${quantity} para o produto: ${productDetails.name}`);
            return false;
          }

          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity, stock: productDetails.stock } : i
            ),
          }));
          return true;
        },
        clearCart: () => set({ items: [] }),
        getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
        getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
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