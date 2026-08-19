import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { listAnalytics, listOrders, listProducts } from '@/lib/data';
import type { AnalyticsEvent, Order, Product } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { StatCard, Card, Tabs, Badge } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatCurrency, formatNumber, formatCompact, formatDate } from '@/lib/utils';
import { DollarSign, ShoppingBag, Eye, MousePointerClick, TrendingUp, BarChart3 } from 'lucide-react';

export function AnalyticsPage() {
  const { store } = useStore();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const [e, o, p] = await Promise.all([
        listAnalytics(store.id, range),
        listOrders(store.id),
        listProducts(store.id),
      ]);
      setEvents(e);
      setOrders(o);
      setProducts(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du chargement des analyses');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store, range]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.payment_status === 'success')
      .reduce((sum, o) => sum + o.total_cents, 0);
    const views = events.filter((e) => e.event_type === 'page_view' || e.event_type === 'store_view').length;
    const productViews = events.filter((e) => e.event_type === 'product_view').length;
    const purchases = events.filter((e) => e.event_type === 'purchase').length;
    const conversion = views > 0 ? (purchases / views) * 100 : 0;

    // Daily data for chart
    const days = Array.from({ length: range }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (range - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const dailyViews = days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return events.filter((e) => {
        const ed = new Date(e.created_at);
        return ed >= d && ed < next && (e.event_type === 'page_view' || e.event_type === 'store_view');
      }).length;
    });

    const dailyRevenue = days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return orders
        .filter((o) => {
          const od = new Date(o.created_at);
          return o.payment_status === 'success' && od >= d && od < next;
        })
        .reduce((sum, o) => sum + o.total_cents, 0);
    });

    // Top products by views
    const productViewCounts: Record<string, number> = {};
    events.filter((e) => e.event_type === 'product_view' && e.product_id).forEach((e) => {
      productViewCounts[e.product_id as string] = (productViewCounts[e.product_id as string] || 0) + 1;
    });
    const topProducts = Object.entries(productViewCounts)
      .map(([pid, count]) => ({ product: products.find((p) => p.id === pid), views: count }))
      .filter((x) => x.product)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return { revenue, views, productViews, purchases, conversion, dailyViews, dailyRevenue, days, topProducts };
  }, [events, orders, products, range]);

  if (loading) return <LoadingPage label="Chargement des analyses..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const maxViews = Math.max(...stats.dailyViews, 1);
  const maxRev = Math.max(...stats.dailyRevenue, 1);

  return (
    <div>
      <DashboardPageHeader
        title="Analyses"
        description="Comprenez les performances de votre boutique"
        action={
          <div className="flex gap-2">
            {([7, 30, 90] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  range === r ? 'bg-ink text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Revenus" value={formatCurrency(stats.revenue)} icon={<DollarSign className="h-5 w-5" />} accent="turquoise" />
        <StatCard label="Vues de la boutique" value={formatNumber(stats.views)} icon={<Eye className="h-5 w-5" />} accent="sky" />
        <StatCard label="Vues des produits" value={formatNumber(stats.productViews)} icon={<BarChart3 className="h-5 w-5" />} accent="orange" />
        <StatCard label="Conversion" value={`${stats.conversion.toFixed(1)}%`} icon={<TrendingUp className="h-5 w-5" />} accent="turquoise" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Views chart */}
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-1">Vues de la boutique</h3>
          <p className="text-sm text-slate-400 mb-5">{formatNumber(stats.views)} vues au total</p>
          <div className="flex items-end justify-between gap-1 h-40">
            {stats.dailyViews.map((value, i) => {
              const heightPct = (value / maxViews) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex-1 flex items-end relative">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-sky-400 to-sky-300 group-hover:from-sky-500 group-hover:to-sky-400 transition-all"
                      style={{ height: `${Math.max(heightPct, value > 0 ? 6 : 2)}%` }}
                    />
                  </div>
                  {(range <= 30 || i % Math.ceil(range / 10) === 0) && (
                    <span className="text-[10px] text-slate-400">
                      {stats.days[i].toLocaleDateString('fr', { month: 'numeric', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Revenue chart */}
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-1">Revenus</h3>
          <p className="text-sm text-slate-400 mb-5">{formatCurrency(stats.revenue)} au total</p>
          <div className="flex items-end justify-between gap-1 h-40">
            {stats.dailyRevenue.map((value, i) => {
              const heightPct = (value / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex-1 flex items-end relative">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-turquoise-400 to-turquoise-300 group-hover:from-turquoise-500 group-hover:to-turquoise-400 transition-all"
                      style={{ height: `${Math.max(heightPct, value > 0 ? 6 : 2)}%` }}
                    />
                  </div>
                  {(range <= 30 || i % Math.ceil(range / 10) === 0) && (
                    <span className="text-[10px] text-slate-400">
                      {stats.days[i].toLocaleDateString('fr', { month: 'numeric', day: 'numeric' })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top products */}
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Produits les plus vus</h3>
        {stats.topProducts.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-7 w-7" />}
            title="Aucune donnée pour le moment"
            description="Les vues de produits apparaîtront ici dès que les visiteurs parcourront votre vitrine."
          />
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map(({ product, views }, i) => (
              <div key={product!.id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-300 w-5">{i + 1}</span>
                <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {product!.cover_url ? (
                    <img src={product!.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <BarChart3 className="h-4 w-4 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{product!.title}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(product!.price_cents)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sky-600">{formatNumber(views)}</p>
                  <p className="text-xs text-slate-400">vues</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
