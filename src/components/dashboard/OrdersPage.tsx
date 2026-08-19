import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { listOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Card, Badge, Tabs } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { PAYMENT_STATUS_COLORS } from '@/lib/payment';
import { ShoppingBag, Search } from 'lucide-react';
import { paymentStatusLabel, paymentMethodLabel } from '@/lib/payment';

export function OrdersPage() {
  const { store } = useStore();
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const data = await listOrders(store.id);
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du chargement des commandes');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const filtered = orders.filter((o) => {
    if (tab === 'completed' && o.status !== 'completed') return false;
    if (tab === 'pending' && o.status !== 'pending') return false;
    if (tab === 'failed' && o.status !== 'failed') return false;
    if (tab === 'refunded' && o.status !== 'refunded') return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        o.customer_email.toLowerCase().includes(s) ||
        o.payment_ref?.toLowerCase().includes(s) ||
        o.customer_name?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const counts = {
    all: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    failed: orders.filter((o) => o.status === 'failed').length,
    refunded: orders.filter((o) => o.status === 'refunded').length,
  };

  if (loading) return <LoadingPage label="Chargement des commandes..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader title="Commandes" description={`${orders.length} commande(s) au total`} />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Rechercher par e-mail, nom ou référence..."
          />
        </div>
      </div>

      <Tabs
        tabs={[
          { value: 'all', label: 'Toutes', count: counts.all },
          { value: 'completed', label: 'Terminées', count: counts.completed },
          { value: 'pending', label: 'En attente', count: counts.pending },
          { value: 'failed', label: 'Échouées', count: counts.failed },
          { value: 'refunded', label: 'Remboursées', count: counts.refunded },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Card className="mt-4 p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title={orders.length === 0 ? 'Aucune commande pour le moment' : 'Aucune commande correspondante'}
            description={orders.length === 0 ? 'Les commandes de votre vitrine apparaîtront ici.' : 'Essayez un autre filtre ou une autre recherche.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Commande</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Paiement</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Méthode</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Total</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium">#{order.payment_ref?.slice(-8) || order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">{order.customer_name || order.customer_email}</p>
                      <p className="text-xs text-slate-400">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={PAYMENT_STATUS_COLORS[order.payment_status]}>
                        {paymentStatusLabel(order.payment_status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 capitalize">
                      {paymentMethodLabel(order.payment_method ?? undefined)}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-right">{formatCurrency(order.total_cents)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 text-right">{formatRelative(order.created_at)}</td>
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
