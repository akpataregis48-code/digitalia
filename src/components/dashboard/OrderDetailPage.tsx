import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import { getOrder, listOrderItems, updateOrderStatus, createRefund, listRefunds } from '@/lib/data';
import type { Order, OrderItem, Refund } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Button } from '@/components/ui';
import { Card, Badge, ConfirmDialog, Modal, Textarea } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatCurrency, formatDateTime, formatRelative } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/payment';
import { ArrowLeft, ShoppingBag, RotateCcw, Mail, Globe, CreditCard, FileText } from 'lucide-react';

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { store } = useStore();
  const { navigate } = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const [o, its] = await Promise.all([getOrder(orderId), listOrderItems(orderId)]);
      setOrder(o);
      setItems(its);
      if (store) {
        const refs = await listRefunds(store.id);
        setRefunds(refs.filter((r: Refund) => r.order_id === orderId));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleRefund = async () => {
    if (!order || !store) return;
    const amount = parseInt(refundAmount || '0', 10);
    if (amount <= 0 || amount > order.total_cents) {
      toast('Enter a valid refund amount', 'error');
      return;
    }
    setProcessing(true);
    try {
      await createRefund(order.id, store.id, amount, refundReason || 'Customer request');
      toast('Refund processed');
      setShowRefund(false);
      setRefundReason('');
      setRefundAmount('');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to process refund', 'error');
    }
    setProcessing(false);
  };

  const handleUpdateStatus = async (status: string, paymentStatus: string) => {
    if (!order) return;
    try {
      const updated = await updateOrderStatus(order.id, status, paymentStatus);
      setOrder(updated);
      toast(`Order marked as ${status}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to update', 'error');
    }
  };

  if (loading) return <LoadingPage label="Loading order..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!order) return <EmptyState icon={<ShoppingBag className="h-7 w-7" />} title="Order not found" description="This order may not exist." />;

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard/orders')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </button>

      <DashboardPageHeader
        title={`Order #${order.payment_ref?.slice(-8) || order.id.slice(0, 8)}`}
        description={formatDateTime(order.created_at)}
        action={
          order.payment_status === 'success' && order.status !== 'refunded' && (
            <Button variant="outline" onClick={() => { setRefundAmount(String(order.total_cents)); setShowRefund(true); }} icon={<RotateCcw className="h-4 w-4" />}>
              Issue refund
            </Button>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <Card className="p-5">
            <h3 className="text-base font-semibold mb-4">Items</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {item.cover_url ? (
                      <img src={item.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <FileText className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product_title}</p>
                    <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.price_cents * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal_cents)}</span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-turquoise-600">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>-{formatCurrency(order.discount_cents)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total_cents)}</span>
              </div>
            </div>
          </Card>

          {/* Refunds */}
          {refunds.length > 0 && (
            <Card className="p-5">
              <h3 className="text-base font-semibold mb-4">Refunds</h3>
              <div className="space-y-3">
                {refunds.map((refund) => (
                  <div key={refund.id} className="flex items-center justify-between p-3 rounded-xl bg-sky-50">
                    <div>
                      <p className="text-sm font-semibold text-sky-700">{formatCurrency(refund.amount_cents)}</p>
                      <p className="text-xs text-sky-600">{refund.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="sky">{refund.status}</Badge>
                      <p className="text-xs text-slate-400 mt-1">{formatRelative(refund.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Payment</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Method</dt>
                <dd className="font-medium">{order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Status</dt>
                <dd><span className={PAYMENT_STATUS_COLORS[order.payment_status]}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Reference</dt>
                <dd className="font-mono text-xs">{order.payment_ref || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Order status</dt>
                <dd><Badge variant={order.status === 'completed' ? 'success' : order.status === 'refunded' ? 'sky' : 'warning'}>{order.status}</Badge></dd>
              </div>
            </dl>

            {order.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => handleUpdateStatus('completed', 'success')}>Mark paid</Button>
                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus('cancelled', 'cancelled')}>Cancel</Button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Customer</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</dt>
                <dd className="font-medium truncate max-w-[160px]">{order.customer_email}</dd>
              </div>
              {order.customer_name && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Name</dt>
                  <dd className="font-medium">{order.customer_name}</dd>
                </div>
              )}
              {order.country && (
                <div className="flex justify-between">
                  <dt className="text-slate-400 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Country</dt>
                  <dd className="font-medium">{order.country}</dd>
                </div>
              )}
            </dl>
          </Card>

          {order.notes && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-2">Notes</h3>
              <p className="text-sm text-slate-500">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={showRefund}
        onClose={() => setShowRefund(false)}
        title="Issue refund"
        description="The customer will be refunded the specified amount."
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowRefund(false)}>Cancel</Button>
            <Button onClick={handleRefund} loading={processing} disabled={processing}>Process refund</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Refund amount (cents)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="input"
              placeholder={String(order.total_cents)}
            />
            <p className="mt-1.5 text-xs text-slate-400">Order total: {formatCurrency(order.total_cents)}</p>
          </div>
          <Textarea
            label="Reason (optional)"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Customer request, duplicate charge, etc."
          />
        </div>
      </Modal>
    </div>
  );
}
