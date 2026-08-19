import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import {
  getStoreBySlug, getStorefront, listPublishedProducts, getProductBySlug,
  trackEvent, validateCoupon, createOrder,
} from '@/lib/data';
import { processPayment } from '@/lib/payment';
import type { Store, Storefront, Product, StorefrontTheme, StorefrontBlock } from '@/lib/types';
import { StorefrontRenderer, StorefrontHeader, StorefrontFooter } from './StorefrontRenderer';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui';
import { formatCurrency, classNames } from '@/lib/utils';
import {
  ShoppingBag, ArrowLeft, Plus, Minus, Trash2, Tag, X, Check, Download,
  CreditCard, Smartphone, Wallet, ShieldCheck, Loader2, ArrowRight,
} from 'lucide-react';


// ---------- Store Home ----------
export function StoreHomePage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { add } = useCart();
  const [store, setStore] = useState<Store | null>(null);
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getStoreBySlug(slug);
        if (!s) {
          setError('Boutique introuvable');
          setLoading(false);
          return;
        }
        setStore(s);
        const [sf, ps] = await Promise.all([getStorefront(s.id), listPublishedProducts(s.id)]);
        setStorefront(sf);
        setProducts(ps);
        trackEvent(s.id, 'store_view', { slug });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Échec du chargement de la boutique');
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <LoadingPage label="Chargement de la boutique..." />;
  if (error) return <ErrorState message={error} />;
  if (!store) return <ErrorState message="Boutique introuvable" />;

  const theme: StorefrontTheme = storefront?.published_theme || storefront?.theme || {
    primary: '#45C7B2', accent: '#FF8A3D', headingFont: 'Manrope', radius: 16, layout: 'centered',
  };
  const blocks: StorefrontBlock[] = storefront?.published_blocks || storefront?.blocks || [];

  return (
    <div className="min-h-screen bg-white">
      <StorefrontHeader store={store} />
      <StorefrontRenderer
        store={store}
        theme={theme}
        blocks={blocks}
        products={products}
        onProductClick={(p) => navigate(`/store/${slug}/product/${p.slug}`)}
      />
      {blocks.length === 0 && (
        <div className="py-20">
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="Boutique à venir"
            description="Cette boutique n'a pas encore été configurée."
          />
        </div>
      )}
      <StorefrontFooter store={store} />
    </div>
  );
}

// ---------- Product Detail ----------
export function StoreProductPage({ slug, productSlug }: { slug: string; productSlug: string }) {
  const { navigate } = useRouter();
  const { add, items, storeId } = useCart();
  const toast = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await getStoreBySlug(slug);
        if (!s) {
          setError('Boutique introuvable');
          setLoading(false);
          return;
        }
        setStore(s);
        const p = await getProductBySlug(s.id, productSlug);
        if (!p) {
          setError('Produit introuvable');
          setLoading(false);
          return;
        }
        setProduct(p);
        trackEvent(s.id, 'product_view', { product_id: p.id, slug: productSlug });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Échec du chargement du produit');
      }
      setLoading(false);
    })();
  }, [slug, productSlug]);

  const handleAddToCart = () => {
    if (!product || !store) return;
    // If cart has items from a different store, confirm replacing
    if (storeId && storeId !== store.id && items.length > 0) {
      if (!confirm('Votre panier contient des articles d’une autre boutique. Remplacer par cet article ?')) return;
    }
    add(product, store.id);
    setAdded(true);
    toast('Ajouté au panier');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || !store) return;
    if (storeId && storeId !== store.id && items.length > 0) {
      if (!confirm('Votre panier contient des articles d’une autre boutique. Remplacer par cet article ?')) return;
    }
    add(product, store.id);
    navigate(`/store/${slug}/checkout`);
  };

  if (loading) return <LoadingPage label="Chargement du produit..." />;
  if (error || !store || !product) {
    return (
      <div className="min-h-screen bg-white">
        <StorefrontHeader store={store || { id: '', name: 'Boutique', slug, tagline: null, logo_url: null, cover_url: null, contact_email: null, description: null, currency: 'USD', published: true, social_links: {}, user_id: '', created_at: '', updated_at: '' }} />
        <ErrorState message={error || 'Produit introuvable'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StorefrontHeader store={store} />
      <div className="max-w-5xl mx-auto px-5 py-8">
        <button
          onClick={() => navigate(`/store/${slug}`)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la boutique
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden">
            {product.cover_url ? (
              <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <ShoppingBag className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <span className="text-sm font-semibold text-turquoise-600">{product.category}</span>
            )}
            <h1 className="text-3xl font-bold mt-1 mb-3">{product.title}</h1>
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl font-bold">{formatCurrency(product.price_cents)}</span>
              {product.compare_at_cents && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(product.compare_at_cents)}</span>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
              {product.description || 'Aucune description fournie.'}
            </p>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge-slate">{tag}</span>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button onClick={handleAddToCart} variant="outline" className="flex-1" icon={added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>
                {added ? 'Ajouté !' : 'Ajouter au panier'}
              </Button>
              <Button onClick={handleBuyNow} className="flex-1" icon={<ArrowRight className="h-4 w-4" />}>
                Acheter maintenant
              </Button>
            </div>

            <div className="space-y-2.5 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Download className="h-4 w-4 text-turquoise-500" /> Téléchargement immédiat après l'achat
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 text-sky-500" /> Paiement sécurisé
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Check className="h-4 w-4 text-orange-500" /> Accès à vie
              </div>
            </div>
          </div>
        </div>
      </div>
      <StorefrontFooter store={store} />
    </div>
  );
}

// ---------- Cart ----------
export function CartPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { items, remove, updateQty, subtotal, count, clear, storeId } = useCart();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    getStoreBySlug(slug).then(setStore).catch(() => {});
  }, [slug]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {store && <StorefrontHeader store={store} />}
        <div className="max-w-2xl mx-auto px-5 py-16">
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="Votre panier est vide"
            description="Parcourez les produits et ajoutez-les à votre panier."
            action={<Button onClick={() => navigate(`/store/${slug}`)}>Parcourir les produits</Button>}
          />
        </div>
        {store && <StorefrontFooter store={store} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {store && <StorefrontHeader store={store} />}
      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Panier ({count})</h1>
          <button onClick={clear} className="text-sm text-slate-400 hover:text-red-500 transition-colors">
            Vider le panier
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white shadow-card p-4">
              <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {item.product.cover_url ? (
                  <img src={item.product.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <ShoppingBag className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigate(`/store/${slug}/product/${item.product.slug}`)}
                  className="text-sm font-semibold hover:text-turquoise-600 transition-colors truncate block text-left"
                >
                  {item.product.title}
                </button>
                <p className="text-sm text-slate-400">{formatCurrency(item.product.price_cents)} l'unité</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQty(item.product.id, item.quantity - 1)}
                  className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm font-bold w-20 text-right">{formatCurrency(item.product.price_cents * item.quantity)}</p>
              <button
                onClick={() => remove(item.product.id)}
                className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-6 shadow-soft">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Sous-total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <Button onClick={() => navigate(`/store/${slug}/checkout`)} className="w-full" size="lg" icon={<ArrowRight className="h-5 w-5" />}>
          Passer au paiement
        </Button>
      </div>
      {store && <StorefrontFooter store={store} />}
    </div>
  );
}

// ---------- Checkout ----------
export function CheckoutPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { items, subtotal, count, clear, storeId } = useCart();
  const toast = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [method, setMethod] = useState<'card' | 'mobile_money' | 'paypal'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ status: string; ref: string } | null>(null);

  useEffect(() => {
    getStoreBySlug(slug).then(setStore).catch(() => {});
  }, [slug]);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !paymentResult) {
      navigate(`/store/${slug}`);
    }
  }, [items.length, slug, navigate, paymentResult]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !store) return;
    setApplyingCoupon(true);
    try {
      const result = await validateCoupon(store.id, couponCode);
      if (result.valid && result.coupon) {
        let disc = 0;
        if (result.coupon.discount_type === 'percent') {
          disc = Math.round((subtotal * result.coupon.discount_value) / 100);
        } else {
          disc = result.coupon.discount_value;
        }
        setDiscount(disc);
        setAppliedCoupon(result.coupon.code);
        toast('Coupon appliqué');
      } else {
        toast(result.message, 'error');
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de l’application du coupon', 'error');
    }
    setApplyingCoupon(false);
  };

  const total = Math.max(subtotal - discount, 0);

  const handlePay = async () => {
    if (!email.trim()) {
      toast('Saisissez votre e-mail', 'error');
      return;
    }
    if (!store) return;
    setProcessing(true);

    try {
      const result = await processPayment(method, total);
      setPaymentResult({ status: result.status, ref: result.reference });

      // Create order in DB regardless of status (even failed ones are recorded)
      await createOrder({
        store_id: store.id,
        customer_email: email.trim(),
        customer_name: name.trim() || undefined,
        subtotal_cents: subtotal,
        discount_cents: discount,
        total_cents: total,
        coupon_code: appliedCoupon || undefined,
        payment_method: method,
        payment_status: result.status,
        payment_ref: result.reference,
        country: country.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.product.id,
          product_title: i.product.title,
          price_cents: i.product.price_cents,
          cover_url: i.product.cover_url,
          quantity: i.quantity,
        })),
      });

      if (result.status === 'success') {
        trackEvent(store.id, 'purchase', { total_cents: total, method });
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec du paiement', 'error');
      setPaymentResult({ status: 'failed', ref: 'ERROR' });
    }
    setProcessing(false);
  };

  // Payment result screen
  if (paymentResult) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="max-w-md w-full">
          <PaymentResult
            status={paymentResult.status}
            ref={paymentResult.ref}
            email={email}
            total={total}
            onContinue={() => {
              if (paymentResult.status === 'success') {
                clear();
              }
              navigate(`/store/${slug}`);
            }}
            onRetry={() => {
              setPaymentResult(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-cream">
      {store && <StorefrontHeader store={store} />}
      <div className="max-w-4xl mx-auto px-5 py-8">
        <button
          onClick={() => navigate(`/store/${slug}/cart`)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </button>

        <h1 className="text-2xl font-bold mb-6">Paiement</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer info */}
            <div className="card shadow-lift p-5">
              <h3 className="text-base font-semibold mb-4">Vos informations</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="vous@exemple.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nom (facultatif)</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="label">Pays (facultatif)</label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} className="input" placeholder="France" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-5">
              <h3 className="text-base font-semibold mb-4">Moyen de paiement</h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'card', label: 'Carte', icon: CreditCard },
                  { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                  { id: 'paypal', label: 'PayPal', icon: Wallet },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={classNames(
                      'rounded-xl border-2 p-4 text-center transition-all',
                      method === m.id ? 'border-turquoise-400 bg-turquoise-50' : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <m.icon className={classNames('h-6 w-6 mx-auto mb-2', method === m.id ? 'text-turquoise-600' : 'text-slate-400')} />
                    <span className={classNames('text-xs font-semibold', method === m.id ? 'text-turquoise-700' : 'text-slate-500')}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>

              {method === 'card' && (
                <div className="mt-4 space-y-3">
                  <input className="input" placeholder="Numéro de carte" defaultValue="4242 4242 4242 4242" />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input" placeholder="MM / AA" defaultValue="12 / 28" />
                    <input className="input" placeholder="CVC" defaultValue="123" />
                  </div>
                  <p className="text-xs text-slate-400">Paiement de démonstration. Aucun prélèvement réel n'est effectué.</p>
                </div>
              )}
              {method === 'mobile_money' && (
                <div className="mt-4 space-y-3">
                  <input className="input" placeholder="Numéro de téléphone" defaultValue="+256 700 000 000" />
                  <p className="text-xs text-slate-400">Paiement mobile money de démonstration. Aucun prélèvement réel.</p>
                </div>
              )}
              {method === 'paypal' && (
                <div className="mt-4">
                  <p className="text-xs text-slate-400">Vous serez redirigé vers PayPal (démonstration). Aucun prélèvement réel.</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-5">
            <div className="card shadow-float p-5 sticky top-24">
              <h3 className="text-base font-semibold mb-4">Récapitulatif de la commande</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {item.product.cover_url ? (
                        <img src={item.product.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <span className="flex-1 truncate text-slate-600">{item.product.title}</span>
                    <span className="text-slate-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-slate-100 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-turquoise-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-turquoise-700">
                      <Tag className="h-3.5 w-3.5" /> {appliedCoupon}
                    </span>
                    <button
                      onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }}
                      className="text-turquoise-400 hover:text-turquoise-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="input text-sm"
                      placeholder="Code de réduction"
                    />
                    <Button size="sm" variant="outline" onClick={handleApplyCoupon} loading={applyingCoupon}>
                      Appliquer
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-turquoise-600">
                    <span>Remise</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                onClick={handlePay}
                loading={processing}
                disabled={processing}
                className="w-full mt-5"
                size="lg"
              >
                {processing ? 'Traitement...' : `Payer ${formatCurrency(total)}`}
              </Button>

              <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Paiement de démonstration sécurisé
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentResult({
  status,
  ref,
  email,
  total,
  onContinue,
  onRetry,
}: {
  status: string;
  ref: string;
  email: string;
  total: number;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const isSuccess = status === 'success';
  const isPending = status === 'pending' || status === 'timeout';

  return (
    <div className="card p-8 text-center animate-scale-in">
      <div
        className={classNames(
          'h-16 w-16 rounded-2xl mx-auto mb-5 flex items-center justify-center',
          isSuccess ? 'bg-turquoise-50' : isPending ? 'bg-orange-50' : 'bg-red-50'
        )}
      >
        {isSuccess ? (
          <Check className="h-8 w-8 text-turquoise-500" strokeWidth={3} />
        ) : isPending ? (
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        ) : (
          <X className="h-8 w-8 text-red-500" strokeWidth={3} />
        )}
      </div>

      <h2 className="text-xl font-bold mb-2">
        {isSuccess ? 'Paiement réussi !' : isPending ? 'Paiement en attente' : 'Échec du paiement'}
      </h2>
      <p className="text-sm text-slate-500 mb-1">
        {isSuccess
          ? 'Votre commande est terminée. Les liens de téléchargement ont été envoyés à votre adresse e-mail.'
          : isPending
          ? 'Votre paiement est en cours de traitement. Nous vous enverrons une notification par e-mail.'
          : `Statut du paiement : ${status.replace(/_/g, ' ')}. Aucun prélèvement effectué.`}
      </p>
      {email && <p className="text-sm text-slate-400 mb-4">{email}</p>}

      <div className="rounded-xl bg-slate-50 p-4 mb-6 text-left">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Référence</span>
          <span className="font-mono text-xs">{ref}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Montant</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        {!isSuccess && (
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            Réessayer
          </Button>
        )}
        <Button className="flex-1" onClick={onContinue}>
          {isSuccess ? 'Continuer mes achats' : 'Retour à la boutique'}
        </Button>
      </div>
    </div>
  );
}
