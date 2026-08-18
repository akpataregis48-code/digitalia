import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from './types';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  storeId: string | null;
  add: (product: Product, storeId: string) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'digitalia_cart';

type PersistedCart = {
  storeId: string | null;
  items: { productId: string; quantity: number }[];
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [productCache, setProductCache] = useState<Record<string, Product>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedCart;
        setStoreId(parsed.storeId);
        // Products will be hydrated when add is called or externally
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (sid: string | null, newItems: CartItem[]) => {
    const data: PersistedCart = {
      storeId: sid,
      items: newItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    };
    localStorage.setItem(CART_KEY, JSON.stringify(data));
  };

  const add = (product: Product, sid: string) => {
    setProductCache((prev) => ({ ...prev, [product.id]: product }));
    setStoreId(sid);
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...prev, { product, quantity: 1 }];
      }
      persist(sid, newItems);
      return newItems;
    });
  };

  const remove = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.product.id !== productId);
      persist(storeId, newItems);
      return newItems;
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      remove(productId);
      return;
    }
    setItems((prev) => {
      const newItems = prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i));
      persist(storeId, newItems);
      return newItems;
    });
  };

  const clear = () => {
    setItems([]);
    setStoreId(null);
    localStorage.removeItem(CART_KEY);
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, storeId, add, remove, updateQty, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
