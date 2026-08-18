import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import { listProducts, createProduct, updateProduct, deleteProduct } from '@/lib/data';
import type { Product, ProductStatus } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Modal, ConfirmDialog, Badge, Card } from '@/components/ui';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatCurrency, formatDate, slugify } from '@/lib/utils';
import { Plus, Package, Edit2, Trash2, MoreVertical, Search, Eye, EyeOff, Archive } from 'lucide-react';

const STATUS_VARIANTS: Record<ProductStatus, 'success' | 'warning' | 'slate'> = {
  published: 'success',
  draft: 'warning',
  archived: 'slate',
};

export function ProductsPage() {
  const { store } = useStore();
  const { navigate } = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ProductStatus>('all');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const load = async () => {
    if (!store) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listProducts(store.id);
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const filtered = products.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast('Product deleted');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const handleQuickStatus = async (product: Product, status: ProductStatus) => {
    try {
      const updated = await updateProduct(product.id, { status });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      toast(`Product ${status}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to update', 'error');
    }
  };

  if (loading) return <LoadingPage label="Loading products..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader
        title="Products"
        description={`${products.length} ${products.length === 1 ? 'product' : 'products'} in your store`}
        action={
          <Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
            New product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            placeholder="Search products..."
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-ink text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-0">
          {products.length === 0 ? (
            <EmptyState
              icon={<Package className="h-7 w-7" />}
              title="No products yet"
              description="Create your first digital product to start selling."
              action={<Button onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>New product</Button>}
            />
          ) : (
            <EmptyState
              icon={<Search className="h-7 w-7" />}
              title="No matches"
              description="Try adjusting your search or filter."
            />
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <Card key={product.id} hover className="p-4 group">
              <div className="relative aspect-[4/3] rounded-xl bg-slate-100 mb-3 overflow-hidden">
                {product.cover_url ? (
                  <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <Package className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant={STATUS_VARIANTS[product.status]}>{product.status}</Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(product)}
                    className="h-7 w-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-ink transition-colors shadow-soft"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1 truncate">{product.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{product.category || 'Uncategorized'}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold">{formatCurrency(product.price_cents)}</p>
                  {product.compare_at_cents && (
                    <p className="text-xs text-slate-400 line-through">{formatCurrency(product.compare_at_cents)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {product.status === 'published' ? (
                    <button
                      onClick={() => handleQuickStatus(product, 'draft')}
                      className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-ink transition-colors"
                      title="Unpublish"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickStatus(product, 'published')}
                      className="h-8 w-8 rounded-lg hover:bg-turquoise-50 flex items-center justify-center text-slate-400 hover:text-turquoise-600 transition-colors"
                      title="Publish"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(product)}
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-ink transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <ProductFormModal
          product={editProduct}
          storeId={store!.id}
          onClose={() => setShowForm(false)}
          onSaved={(product, isNew) => {
            if (isNew) {
              setProducts((prev) => [product, ...prev]);
            } else {
              setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
            }
            setShowForm(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete product?"
        message={`"${deleteTarget?.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function ProductFormModal({
  product,
  storeId,
  onClose,
  onSaved,
}: {
  product: Product | null;
  storeId: string;
  onClose: () => void;
  onSaved: (product: Product, isNew: boolean) => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product ? (product.price_cents / 100).toFixed(2) : '');
  const [compareAt, setCompareAt] = useState(product?.compare_at_cents ? (product.compare_at_cents / 100).toFixed(2) : '');
  const [coverUrl, setCoverUrl] = useState(product?.cover_url || '');
  const [category, setCategory] = useState(product?.category || '');
  const [tags, setTags] = useState((product?.tags || []).join(', '));
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'draft');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug || slugify(title),
        description: description.trim() || null,
        price_cents: Math.round(parseFloat(price || '0') * 100),
        compare_at_cents: compareAt ? Math.round(parseFloat(compareAt) * 100) : null,
        cover_url: coverUrl.trim() || null,
        category: category.trim() || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        featured,
      };
      if (product) {
        const updated = await updateProduct(product.id, payload);
        toast('Product updated');
        onSaved(updated, false);
      } else {
        const created = await createProduct(storeId, payload);
        toast('Product created');
        onSaved(created, true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={product ? 'Edit product' : 'New product'}
      description={product ? 'Update your product details' : 'Create a new digital product'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} disabled={saving}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ultimate Logo Pack"
        />
        <Input
          label="URL slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder="ultimate-logo-pack"
          hint="Used in the product URL on your storefront"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (USD)"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29.00"
            prefix={<span className="text-sm">$</span>}
          />
          <Input
            label="Compare at (optional)"
            type="number"
            step="0.01"
            min="0"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            placeholder="49.00"
            hint="Original price (strikethrough)"
            prefix={<span className="text-sm">$</span>}
          />
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what customers get..."
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Templates"
          />
          <Input
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="design, logos, brand"
          />
        </div>
        <Input
          label="Cover image URL"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://..."
          hint="Paste an image URL for the product cover"
        />
        {coverUrl && (
          <div className="aspect-[4/3] max-h-40 rounded-xl overflow-hidden bg-slate-100">
            <img src={coverUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
          <div>
            <label className="label">Featured</label>
            <button
              onClick={() => setFeatured(!featured)}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                featured ? 'bg-orange-50 border-orange-200 text-orange-600' : 'border-slate-200 text-slate-500'
              }`}
            >
              {featured ? 'Featured on storefront' : 'Not featured'}
            </button>
          </div>
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
