import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getStoreForUser } from './data';
import type { Store } from './types';
import { useAuth } from './auth';

type StoreContextValue = {
  store: Store | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setStore: (store: Store | null) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setStore(null);
      setLoading(false);
      return;
    }
    try {
      const s = await getStoreForUser(user.id);
      setStore(s);
    } catch (e) {
      console.error('Store load error', e);
      setStore(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setStore(null);
      setLoading(false);
    }
  }, [user]);

  return (
    <StoreContext.Provider value={{ store, loading, refresh, setStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
