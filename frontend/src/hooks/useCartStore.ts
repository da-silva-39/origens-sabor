// src/hooks/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantidade: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(i => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map(i =>
              i.id === item.id ? { ...i, quantidade: i.quantidade + item.quantidade } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      updateQuantity: (id, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map(i => (i.id === id ? { ...i, quantidade } : i)),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, i) => acc + i.quantidade, 0),
      getTotalPrice: () => get().items.reduce((acc, i) => acc + i.preco * i.quantidade, 0),
    }),
    { name: 'cart-storage' }
  )
);