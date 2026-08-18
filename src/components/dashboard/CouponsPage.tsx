import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useToast } from '@/lib/toast';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/data';
import type { Coupon } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Card, Badge, Modal, ConfirmDialog } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatDate } from '@/lib/utils';
import { Tag, Plus, Edit2, Trash2, Copy } from 'lucide-react';

export function CouponsPage() {
  const { store } = useStore();
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const data = await listCoupons(store.id);
      setCoupons(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load coupons');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const handleSave = async (data: Partial<Coupon>, id?: string) => {
    if (!store) return;
    try {
      if (id) {
        const updated = await updateCoupon(id, data);
        setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
        toast('Coupon updated');
      } else {
        const created = await createCoupon(store.id, data);
        setCoupons((prev) => [created, ...prev]);
        toast('Coupon created');
      }
      setShowForm(false);
      setEditTarget(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save', 'error');
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    try {
      await deleteCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast('Coupon deleted');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Code copied');
  };

  if (loading) return <LoadingPage label="Loading coupons..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader
        title="Coupons"
        description={`${coupons.length} discount codes`}
        action={
          <Button onClick={() => { setEditTarget(null); setShowForm(true); }} icon={<Plus className="h-4 w-4" />}>
            New coupon
          </Button>
        }
      />

      {coupons.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Tag className="h-7 w-7" />}
            title="No coupons yet"
            description="Create discount codes to boost sales and reward customers."
            action={<Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>New coupon</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold tracking-tight truncate">{coupon.code}</h3>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="text-slate-300 hover:text-turquoise-500 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400">
                    {coupon.discount_type === 'percent'
                      ? `${coupon.discount_value}% off`
                      : `${(coupon.discount_value / 100).toFixed(2)} off`}
                  </p>
                </div>
                <Badge variant={coupon.active ? 'success' : 'slate'}>
                  {coupon.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {coupon.description && <p className="text-sm text-slate-500 mb-3">{coupon.description}</p>}

              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Used</dt>
                  <dd className="font-medium">
                    {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                  </dd>
                </div>
                {coupon.expires_at && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Expires</dt>
                    <dd className="font-medium">{formatDate(coupon.expires_at)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-400">Created</dt>
                  <dd className="font-medium">{formatDate(coupon.created_at)}</dd>
                </div>
              </dl>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditTarget(coupon); setShowForm(true); }}
                  icon={<Edit2 className="h-3.5 w-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(coupon)}
                  className="text-slate-400 hover:text-red-500"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Delete
                </Button>
                <div className="flex-1" />
                <button
                  onClick={() => handleSave({ active: !coupon.active }, coupon.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    coupon.active ? 'text-slate-400 hover:bg-slate-100' : 'text-turquoise-600 hover:bg-turquoise-50'
                  }`}
                >
                  {coupon.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <CouponFormModal
          coupon={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete coupon?"
        message={`Coupon "${deleteTarget?.code}" will be permanently deleted.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function CouponFormModal({
  coupon,
  onClose,
  onSave,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSave: (data: Partial<Coupon>, id?: string) => void;
}) {
  const [code, setCode] = useState(coupon?.code || '');
  const [description, setDescription] = useState(coupon?.description || '');
  const [discountType, setDiscountType] = useState(coupon?.discount_type || 'percent');
  const [discountValue, setDiscountValue] = useState(String(coupon?.discount_value || ''));
  const [maxUses, setMaxUses] = useState(coupon?.max_uses ? String(coupon.max_uses) : '');
  const [active, setActive] = useState(coupon?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(coupon?.expires_at ? coupon.expires_at.slice(0, 10) : '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    if (!code.trim()) {
      setError('Code is required');
      return;
    }
    const value = parseInt(discountValue || '0', 10);
    if (discountType === 'percent' && (value < 1 || value > 100)) {
      setError('Percentage must be between 1 and 100');
      return;
    }
    onSave({
      code: code.toUpperCase().trim(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: value,
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
      active,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    }, coupon?.id);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={coupon ? 'Edit coupon' : 'New coupon'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{coupon ? 'Save changes' : 'Create coupon'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SUMMER20"
          hint="Customers enter this at checkout"
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Summer sale - 20% off"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Discount type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
            options={[
              { value: 'percent', label: 'Percentage (%)' },
              { value: 'fixed', label: 'Fixed amount (cents)' },
            ]}
          />
          <Input
            label={discountType === 'percent' ? 'Percentage value' : 'Amount in cents'}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percent' ? '20' : '1000'}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Max uses (optional)"
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Unlimited"
          />
          <Input
            label="Expiry date (optional)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Status</label>
          <button
            onClick={() => setActive(!active)}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              active ? 'bg-turquoise-50 border-turquoise-200 text-turquoise-600' : 'border-slate-200 text-slate-500'
            }`}
          >
            {active ? 'Active' : 'Inactive'}
          </button>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
