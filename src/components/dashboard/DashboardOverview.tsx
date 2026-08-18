import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { listProducts, listOrders, listCustomers, listAnalytics } from '@/lib/data';
import type { Product, Order, Customer } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { StatCard, Card, Badge } from '@/components/ui';
import { LoadingPage, EmptyState } from '@/components/ui/Feedback';
import { formatCurrency, formatNumber, formatRelative, formatDate } from '@/lib/utils';
import { DollarSign, ShoppingBag, Users, Eye, ArrowRight, Package, TrendingUp } from 'lucide-react';

export function DashboardOverview() {
  const { store } = useStore();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    if (!store) return;
    let mounted = true;
    (async () => {
      try {
        const [p, o, c, events] = await Promise.all([
          listProducts(store.id),
          listOrders(store.id),
          listCustomers(store.id),
          listAnalytics(store.id, 30),
        ]);
        if (!mounted) return;
        setProducts(p);
        setOrders(o);
        setCustomers(c);
        setEventCount(events.length);
      } catch (e) {
        console.error('Dashboard load error', e);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [store]);

  if (loading) return <LoadingPage label="Loading your dashboard..." />;

  const revenue = orders
    .filter((o) => o.payment_status === 'success')
    .reduce((sum, o) => sum + o.total_cents, 0);
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;

  // Last 7 days revenue
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const revenueByDay = last7.map((d) => {
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    return orders
      .filter((o) => {
        const od = new Date(o.created_at);
        return o.payment_status === 'success' && od >= dayStart && od <= dayEnd;
      })
      .reduce((sum, o) => sum + o.total_cents, 0);
  });
  const maxRev = Math.max(...revenueByDay, 1);

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <DashboardPageHeader
        title="Dashboard"
        description="Your store at a glance"
        action={
          <button onClick={() => navigate('/dashboard/products')} className="btn-primary btn-sm">
            Add product
            <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total revenue" value={formatCurrency(revenue)} icon={<DollarSign className="h-5 w-5" />} accent="turquoise" trendUp={revenue > 0} trend={revenue > 0 ? 'live' : undefined} />
        <StatCard label="Orders" value={formatNumber(completedOrders)} icon={<ShoppingBag className="h-5 w-5" />} accent="sky" />
        <StatCard label="Customers" value={formatNumber(customers.length)} icon={<Users className="h-5 w-5" />} accent="orange" />
        <StatCard label="Visitors (30d)" value={formatNumber(eventCount)} icon={<Eye className="h-5 w-5" />} accent="turquoise" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold">Revenue, last 7 days</h3>
              <p className="text-sm text-slate-400">{formatCurrency(revenueByDay.reduce((s, v) => s + v, 0))} total</p>
            </div>
            <Badge variant="turquoise"><TrendingUp className="h-3 w-3" /> Live</Badge>
          </div>
          <div className="flex items-end justify-between gap-2 h-44">
            {revenueByDay.map((value, i) => {
              const date = last7[i];
              const heightPct = (value / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex-1 flex items-end relative">
                    <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-turquoise-100 group-hover:bg-turquoise-200 transition-colors" style={{ height: '100%' }} />
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-turquoise-400 to-sky-400 transition-all duration-300 group-hover:from-turquoise-500 group-hover:to-sky-500"
                      style={{ height: `${Math.max(heightPct, value > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {date.toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Product summary */}
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4">Products</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-turquoise-50">
              <span className="text-sm font-medium text-turquoise-700">Published</span>
              <span className="text-lg font-bold text-turquoise-700">{publishedProducts}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-sm font-medium text-slate-600">Drafts</span>
              <span className="text-lg font-bold text-slate-600">{products.filter((p) => p.status === 'draft').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50">
              <span className="text-sm font-medium text-orange-600">Archived</span>
              <span className="text-lg font-bold text-orange-600">{products.filter((p) => p.status === 'archived').length}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/products')}
            className="btn-outline w-full mt-4"
          >
            Manage products
            <ArrowRight className="h-4 w-4" />
          </button>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="mt-5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Recent orders</h3>
          <button onClick={() => navigate('/dashboard/orders')} className="text-sm font-medium text-turquoise-600 hover:text-turquoise-700">
            View all
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-7 w-7" />}
            title="No orders yet"
            description="Orders will appear here once customers start buying your products."
          />
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Order</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Total</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/orders/${order.id}`)}>
                    <td className="py-3.5 text-sm font-medium">#{order.payment_ref?.slice(-6) || order.id.slice(0, 6)}</td>
                    <td className="py-3.5 text-sm text-slate-500">{order.customer_email}</td>
                    <td className="py-3.5">
                      <Badge variant={
                        order.payment_status === 'success' ? 'success' :
                        order.payment_status === 'pending' ? 'warning' :
                        order.payment_status === 'refunded' ? 'sky' : 'danger'
                      }>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-sm font-semibold text-right">{formatCurrency(order.total_cents)}</td>
                    <td className="py-3.5 text-sm text-slate-400 text-right">{formatRelative(order.created_at)}</td>
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
