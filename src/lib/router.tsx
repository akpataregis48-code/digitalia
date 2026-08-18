import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type RouterContextValue = {
  path: string;
  query: URLSearchParams;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string, opts?: { replace?: boolean }) => {
    if (to === window.location.pathname + window.location.search) return;
    if (opts?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const [pathname, search] = path.split('?');
  const query = new URLSearchParams(search || '');

  return (
    <RouterContext.Provider value={{ path: pathname, query, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export type RouteMatch = {
  params: Record<string, string>;
  element: ReactNode;
};

export function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const v = pathParts[i];
    if (p.startsWith(':')) {
      params[p.slice(1)] = decodeURIComponent(v);
    } else if (p !== v) {
      return null;
    }
  }
  return params;
}
