import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import {
  getProduct, listProductFiles, addProductFile, deleteProductFile,
  updateProduct, listOrders,
} from '@/lib/data';
import type { Product, ProductFile, Order } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Button, Input } from '@/components/ui';
import { Badge, Card, ConfirmDialog } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatCurrency, formatBytes, formatDate, formatRelative } from '@/lib/utils';
import {
  ArrowLeft, FileText, Download, Upload, Trash2, Package, ShoppingBag,
  Edit2, Eye, EyeOff, Save, X,
} from 'lucide-react';

export function ProductDetailPage({ productId }: { productId: string }) {
  const { store } = useStore();
  const { navigate } = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadSize, setUploadSize] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteFile, setDeleteFile] = useState<ProductFile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const [p, f] = await Promise.all([getProduct(productId), listProductFiles(productId)]);
      setProduct(p);
      setFiles(f);
      if (store && p) {
        const allOrders = await listOrders(store.id);
        setOrders(allOrders.filter((o) => o.items?.some?.(() => false) || false));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load product');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const handleUpload = async () => {
    if (!uploadName.trim() || !uploadUrl.trim()) {
      toast('Enter a file name and download URL', 'error');
      return;
    }
    setUploading(true);
    try {
      const sizeBytes = parseInt(uploadSize || '0', 10);
      const ext = uploadName.split('.').pop()?.toUpperCase() || 'FILE';
      const file = await addProductFile(productId, {
        name: uploadName.trim(),
        size_bytes: isNaN(sizeBytes) ? 0 : sizeBytes,
        file_type: ext,
        download_url: uploadUrl.trim(),
      });
      setFiles((prev) => [file, ...prev]);
      setUploadName('');
      setUploadUrl('');
      setUploadSize('');
      setShowUpload(false);
      toast('File added');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to add file', 'error');
    }
    setUploading(false);
  };

  const handleDeleteFile = async (file: ProductFile) => {
    try {
      await deleteProductFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast('File removed');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!product) return;
    setSavingEdit(true);
    try {
      const updated = await updateProduct(product.id, {
        title: editTitle,
        price_cents: Math.round(parseFloat(editPrice || '0') * 100),
        description: editDesc,
      });
      setProduct(updated);
      setEditing(false);
      toast('Product updated');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to update', 'error');
    }
    setSavingEdit(false);
  };

  const startEdit = () => {
    if (!product) return;
    setEditTitle(product.title);
    setEditPrice((product.price_cents / 100).toFixed(2));
    setEditDesc(product.description || '');
    setEditing(true);
  };

  const togglePublish = async () => {
    if (!product) return;
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await updateProduct(product.id, { status: newStatus });
      setProduct(updated);
      toast(`Product ${newStatus}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed', 'error');
    }
  };

  if (loading) return <LoadingPage label="Loading product..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!product) return <EmptyState icon={<Package className="h-7 w-7" />} title="Product not found" description="This product may have been deleted." />;

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard/products')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <DashboardPageHeader
        title={editing ? '' : product.title}
        description={editing ? undefined : `${product.category || 'Uncategorized'} · ${formatCurrency(product.price_cents)}`}
        action={
          !editing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={togglePublish} icon={product.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}>
                {product.status === 'published' ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="outline" onClick={startEdit} icon={<Edit2 className="h-4 w-4" />}>
                Edit
              </Button>
            </div>
          )
        }
      />

      {editing && (
        <Card className="p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Edit product</h3>
            <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-ink"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Input label="Price (USD)" type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} prefix={<span>$</span>} />
            <div>
              <label className="label">Description</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input min-h-[100px]" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} loading={savingEdit} icon={<Save className="h-4 w-4" />}>Save</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Cover + description */}
          <Card className="p-5">
            <div className="aspect-[16/9] rounded-xl bg-slate-100 overflow-hidden mb-4">
              {product.cover_url ? (
                <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                  <Package className="h-12 w-12 text-slate-300" />
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description provided yet.'}
            </p>
            {product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="slate">{tag}</Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Files */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">Digital files</h3>
                <p className="text-sm text-slate-400">Files customers get after purchase</p>
              </div>
              <Button size="sm" onClick={() => setShowUpload(!showUpload)} icon={<Upload className="h-4 w-4" />}>
                Add file
              </Button>
            </div>

            {showUpload && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4 space-y-3">
                <Input label="File name" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="logo-pack.zip" />
                <Input label="Download URL" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://..." />
                <Input label="Size in bytes (optional)" type="number" value={uploadSize} onChange={(e) => setUploadSize(e.target.value)} placeholder="10485760" />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowUpload(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleUpload} loading={uploading}>Add file</Button>
                </div>
              </div>
            )}

            {files.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-7 w-7" />}
                title="No files uploaded"
                description="Add the digital files that customers will download after purchase."
                action={<Button size="sm" onClick={() => setShowUpload(true)} icon={<Upload className="h-4 w-4" />}>Add file</Button>}
              />
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors group">
                    <div className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{file.file_type} · {formatBytes(file.size_bytes)}</p>
                    </div>
                    {file.download_url && (
                      <a
                        href={file.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-ink transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteFile(file)}
                      className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Status</dt>
                <dd><Badge variant={product.status === 'published' ? 'success' : product.status === 'draft' ? 'warning' : 'slate'}>{product.status}</Badge></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Price</dt>
                <dd className="font-semibold">{formatCurrency(product.price_cents)}</dd>
              </div>
              {product.compare_at_cents && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Compare at</dt>
                  <dd className="text-slate-400 line-through">{formatCurrency(product.compare_at_cents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-400">Featured</dt>
                <dd>{product.featured ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Created</dt>
                <dd>{formatDate(product.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Updated</dt>
                <dd>{formatRelative(product.updated_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Storefront link</h3>
            <p className="text-xs text-slate-400 mb-3">View this product on your public store</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => store && navigate(`/store/${store.slug}/product/${product.slug}`)}
              icon={<ShoppingBag className="h-4 w-4" />}
            >
              View on storefront
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={() => deleteFile && handleDeleteFile(deleteFile)}
        title="Remove file?"
        message={`"${deleteFile?.name}" will be removed from this product.`}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
