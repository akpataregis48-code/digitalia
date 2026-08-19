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
      setError(e instanceof Error ? e.message : 'Échec du chargement des coupons');
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
        toast('Coupon mis à jour');
      } else {
        const created = await createCoupon(store.id, data);
        setCoupons((prev) => [created, ...prev]);
        toast('Coupon créé');
      }
      setShowForm(false);
      setEditTarget(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de l’enregistrement', 'error');
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    try {
      await deleteCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      toast('Coupon supprimé');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de la suppression', 'error');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Code copié');
  };

  if (loading) return <LoadingPage label="Chargement des coupons..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader
        title="Coupons"
        description={`${coupons.length} code(s) de réduction`}
        action={
          <Button onClick={() => { setEditTarget(null); setShowForm(true); }} icon={<Plus className="h-4 w-4" />}>
            Nouveau coupon
          </Button>
        }
      />

      {coupons.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Tag className="h-7 w-7" />}
            title="Aucun coupon pour le moment"
            description="Créez des codes de réduction pour booster vos ventes et récompenser vos clients."
            action={<Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>Nouveau coupon</Button>}
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
                      ? `${coupon.discount_value} % de remise`
                      : `${(coupon.discount_value / 100).toFixed(2)} $ de remise`}
                  </p>
                </div>
                <Badge variant={coupon.active ? 'success' : 'slate'}>
                  {coupon.active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {coupon.description && <p className="text-sm text-slate-500 mb-3">{coupon.description}</p>}

              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Utilisations</dt>
                  <dd className="font-medium">
                    {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                  </dd>
                </div>
                {coupon.expires_at && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Expire le</dt>
                    <dd className="font-medium">{formatDate(coupon.expires_at)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-400">Créé le</dt>
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
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(coupon)}
                  className="text-slate-400 hover:text-red-500"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Supprimer
                </Button>
                <div className="flex-1" />
                <button
                  onClick={() => handleSave({ active: !coupon.active }, coupon.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                    coupon.active ? 'text-slate-400 hover:bg-slate-100' : 'text-turquoise-600 hover:bg-turquoise-50'
                  }`}
                >
                  {coupon.active ? 'Désactiver' : 'Activer'}
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
        title="Supprimer le coupon ?"
        message={`Le coupon « ${deleteTarget?.code} » sera définitivement supprimé.`}
        confirmLabel="Supprimer"
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
      setError('Le code est requis');
      return;
    }
    const value = parseInt(discountValue || '0', 10);
    if (discountType === 'percent' && (value < 1 || value > 100)) {
      setError('Le pourcentage doit être compris entre 1 et 100');
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
      title={coupon ? 'Modifier le coupon' : 'Nouveau coupon'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>{coupon ? 'Enregistrer les modifications' : 'Créer le coupon'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Code du coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SUMMER20"
          hint="Les clients le saisissent au moment du paiement"
        />
        <Textarea
          label="Description (facultatif)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Soldes d'été - 20 % de remise"
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type de remise"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
            options={[
              { value: 'percent', label: 'Pourcentage (%)' },
              { value: 'fixed', label: 'Montant fixe (centimes)' },
            ]}
          />
          <Input
            label={discountType === 'percent' ? 'Valeur en pourcentage' : 'Montant en centimes'}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === 'percent' ? '20' : '1000'}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Utilisations max (facultatif)"
            type="number"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Illimité"
          />
          <Input
            label="Date d'expiration (facultatif)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Statut</label>
          <button
            onClick={() => setActive(!active)}
            className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              active ? 'bg-turquoise-50 border-turquoise-200 text-turquoise-600' : 'border-slate-200 text-slate-500'
            }`}
          >
            {active ? 'Actif' : 'Inactif'}
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
