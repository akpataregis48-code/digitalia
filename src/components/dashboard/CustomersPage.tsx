import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { listCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Card } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatCurrency, formatDate, initials } from '@/lib/utils';
import { Users, Search, Mail, Globe, ShoppingBag } from 'lucide-react';

export function CustomersPage() {
  const { store } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const data = await listCustomers(store.id);
      setCustomers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du chargement des clients');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.email.toLowerCase().includes(s) || (c.full_name?.toLowerCase().includes(s) ?? false);
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent_cents, 0);
  const avgOrder = customers.length > 0 ? totalRevenue / customers.reduce((s, c) => s + c.orders_count, 0) : 0;

  if (loading) return <LoadingPage label="Chargement des clients..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader title="Clients" description={`${customers.length} client(s)`} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="p-4">
          <p className="text-xs text-slate-400 mb-1">Revenus totaux</p>
          <p className="text-xl font-bold text-turquoise-600">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 mb-1">Commandes totales</p>
          <p className="text-xl font-bold text-sky-600">{customers.reduce((s, c) => s + c.orders_count, 0)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-400 mb-1">Panier moyen</p>
          <p className="text-xl font-bold text-orange-600">{formatCurrency(avgOrder)}</p>
        </Card>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Rechercher des clients..."
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title={customers.length === 0 ? 'Aucun client pour le moment' : 'Aucun résultat'}
            description={customers.length === 0 ? 'Les clients apparaissent ici automatiquement lorsqu’ils passent commande.' : 'Essayez une autre recherche.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Localisation</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Commandes</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Dépensé</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Depuis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-turquoise-100 to-sky-100 flex items-center justify-center text-xs font-bold text-turquoise-600 shrink-0">
                          {initials(c.full_name || c.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{c.full_name || c.email.split('@')[0]}</p>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {c.country ? (
                        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {c.country}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-medium">{c.orders_count}</td>
                    <td className="px-5 py-3.5 text-sm text-right font-semibold">{formatCurrency(c.total_spent_cents)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 text-right">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
