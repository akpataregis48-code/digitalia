import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { Store } from '@/lib/types';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { MarketingHeader, MarketingFooter } from '@/components/marketing/MarketingChrome';
import { Sparkles, ArrowRight, Search } from 'lucide-react';

export function StoresBrowsePage() {
  const { navigate } = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setStores((data || []) as Store[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Échec du chargement des boutiques');
      }
      setLoading(false);
    })();
  }, []);

  const filtered = stores.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.tagline?.toLowerCase().includes(q) ?? false) ||
      (s.description?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <div className="max-w-container mx-auto px-5 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-h2 mb-3">Parcourir les boutiques</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Découvrez les produits numériques de créateurs du monde entier.</p>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Rechercher des boutiques..."
          />
        </div>

        {loading ? (
          <LoadingPage label="Chargement des boutiques..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-7 w-7" />}
            title={stores.length === 0 ? 'Aucune boutique pour le moment' : 'Aucun résultat'}
            description={stores.length === 0 ? 'Soyez le premier à publier une boutique !' : 'Essayez une autre recherche.'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((store) => (
              <button
                key={store.id}
                onClick={() => navigate(`/store/${store.slug}`)}
                className="group card card-hover p-5 text-left"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center shrink-0">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold truncate group-hover:text-turquoise-600 transition-colors">{store.name}</h3>
                    {store.tagline && <p className="text-xs text-slate-400 truncate">{store.tagline}</p>}
                  </div>
                </div>
                {store.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{store.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">digitalia.store/{store.slug}</span>
                  <span className="flex items-center gap-1 text-turquoise-600 font-medium group-hover:gap-2 transition-all">
                    Visiter <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <MarketingFooter />
    </div>
  );
}
