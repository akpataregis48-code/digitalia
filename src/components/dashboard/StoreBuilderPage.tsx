import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import {
  ensureStorefront, saveStorefront, publishStorefront,
  listPublishedProducts, updateStore,
} from '@/lib/data';
import type { StorefrontBlock, StorefrontTheme, Storefront, Product } from '@/lib/types';
import { uid, classNames } from '@/lib/utils';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui';
import {
  Undo2, Redo2, Save, Eye, Send, GripVertical, Trash2, Plus,
  Type, Image, Layout, ShoppingBag, Star, PanelTop as BannerIcon,
  Smartphone, Monitor, ChevronDown, Check,
} from 'lucide-react';

const BLOCK_LIBRARY: { type: StorefrontBlock['type']; label: string; icon: typeof Type; description: string }[] = [
  { type: 'hero', label: 'Héros', icon: Layout, description: 'Grand titre avec appel à l’action' },
  { type: 'products', label: 'Produits', icon: ShoppingBag, description: 'Grille de vos produits' },
  { type: 'features', label: 'Atouts', icon: Star, description: 'Liste d’atouts avec icônes' },
  { type: 'text', label: 'Texte', icon: Type, description: 'Section de texte enrichi' },
  { type: 'image', label: 'Image', icon: Image, description: 'Bloc image unique' },
  { type: 'banner', label: 'Bandeau', icon: BannerIcon, description: 'Barre d’annonce colorée' },
];

const DEFAULT_THEME: StorefrontTheme = {
  primary: '#45C7B2',
  accent: '#FF8A3D',
  headingFont: 'Manrope',
  radius: 16,
  layout: 'centered',
};

function makeBlock(type: StorefrontBlock['type']): StorefrontBlock {
  const id = uid('blk');
  switch (type) {
    case 'hero':
      return { id, type, title: 'Produits numériques premium', subtitle: 'Téléchargements instantanés. Paiement sécurisé.', ctaText: 'Voir les produits', bg: '#EAFBF6' };
    case 'products':
      return { id, type, title: 'Produits en vedette', limit: 6, columns: 3 };
    case 'features':
      return { id, type, title: 'Pourquoi acheter chez nous', items: [
        { icon: 'Download', title: 'Téléchargement instantané', text: 'Recevez vos fichiers immédiatement.' },
        { icon: 'ShieldCheck', title: 'Paiements sécurisés', text: 'Plusieurs moyens de paiement.' },
        { icon: 'RefreshCw', title: 'Mises à jour à vie', text: 'Des mises à jour gratuites pour toujours.' },
      ]};
    case 'text':
      return { id, type, title: 'À propos de notre boutique', body: 'Nous créons des produits numériques premium pour créateurs et professionnels.' };
    case 'image':
      return { id, type, src: '', caption: '', rounded: true };
    case 'banner':
      return { id, type, text: 'Livraison gratuite sur tous les produits numériques !', bg: '#FF8A3D' };
  }
}

export function StoreBuilderPage() {
  const { store } = useStore();
  const { navigate } = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [theme, setTheme] = useState<StorefrontTheme>(DEFAULT_THEME);
  const [blocks, setBlocks] = useState<StorefrontBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<{ theme: StorefrontTheme; blocks: StorefrontBlock[] }[]>([]);
  const [future, setFuture] = useState<{ theme: StorefrontTheme; blocks: StorefrontBlock[] }[]>([]);
  const skipHistoryRef = useRef(false);

  const pushHistory = useCallback((prevTheme: StorefrontTheme, prevBlocks: StorefrontBlock[]) => {
    setHistory((h) => [...h.slice(-49), { theme: prevTheme, blocks: prevBlocks }]);
    setFuture([]);
  }, []);

  const updateBlocks = useCallback((updater: (prev: StorefrontBlock[]) => StorefrontBlock[]) => {
    setBlocks((prev) => {
      if (!skipHistoryRef.current) {
        pushHistory(theme, prev);
      }
      skipHistoryRef.current = false;
      return updater(prev);
    });
  }, [theme, pushHistory]);

  const updateTheme = useCallback((patch: Partial<StorefrontTheme>) => {
    setTheme((prev) => {
      if (!skipHistoryRef.current) {
        pushHistory(prev, blocks);
      }
      skipHistoryRef.current = false;
      return { ...prev, ...patch };
    });
  }, [blocks, pushHistory]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [...f, { theme, blocks }]);
      skipHistoryRef.current = true;
      setTheme(prev.theme);
      skipHistoryRef.current = true;
      setBlocks(prev.blocks);
      return h.slice(0, -1);
    });
  }, [theme, blocks]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[f.length - 1];
      setHistory((h) => [...h, { theme, blocks }]);
      skipHistoryRef.current = true;
      setTheme(next.theme);
      skipHistoryRef.current = true;
      setBlocks(next.blocks);
      return f.slice(0, -1);
    });
  }, [theme, blocks]);

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const sf = await ensureStorefront(store.id);
      setStorefront(sf);
      setTheme(sf.theme || DEFAULT_THEME);
      setBlocks(sf.blocks || []);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec du chargement de l’éditeur');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const sf = await saveStorefront(store.id, theme, blocks);
      setStorefront(sf);
      toast('Brouillon enregistré');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de l’enregistrement', 'error');
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!store) return;
    setPublishing(true);
    try {
      await publishStorefront(store.id, theme, blocks);
      if (!store.published) {
        await updateStore(store.id, { published: true });
      }
      toast('Boutique publiée ! Votre vitrine est en ligne.');
      setPublishOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de la publication', 'error');
    }
    setPublishing(false);
  };

  const handleAddBlock = (type: StorefrontBlock['type']) => {
    const block = makeBlock(type);
    updateBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
  };

  const handleDeleteBlock = (id: string) => {
    updateBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicateBlock = (id: string) => {
    updateBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy = { ...original, id: uid('blk') } as StorefrontBlock;
      const newBlocks = [...prev];
      newBlocks.splice(idx + 1, 0, copy);
      return newBlocks;
    });
  };

  const handleMoveBlock = (id: string, dir: 'up' | 'down') => {
    updateBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const newBlocks = [...prev];
      [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
      return newBlocks;
    });
  };

  const handleUpdateBlock = (id: string, patch: Partial<StorefrontBlock>) => {
    updateBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as StorefrontBlock) : b)));
  };

  // Drag and drop
  const dragRef = useRef<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (id: string) => {
    dragRef.current = id;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    const dragId = dragRef.current;
    if (!dragId) return;
    updateBlocks((prev) => {
      const fromIdx = prev.findIndex((b) => b.id === dragId);
      if (fromIdx === -1 || fromIdx === idx) return prev;
      const newBlocks = [...prev];
      const [moved] = newBlocks.splice(fromIdx, 1);
      newBlocks.splice(idx, 0, moved);
      return newBlocks;
    });
    dragRef.current = null;
    setDragOverIdx(null);
  };

  if (loading) return <LoadingPage label="Chargement de l'éditeur de boutique..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!store) return <EmptyState icon={<Layout className="h-7 w-7" />} title="Aucune boutique" description="Créez d'abord une boutique." />;

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  return (
    <div className="fixed inset-0 z-30 bg-cream flex flex-col lg:pl-64">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-slate-400 hover:text-ink transition-colors flex items-center gap-1.5"
          >
            ← Tableau de bord
          </button>
          <span className="text-slate-200">/</span>
          <span className="text-sm font-semibold">Éditeur de boutique</span>
          <span className="badge-slate ml-2">Brouillon</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-white shadow-soft text-ink' : 'text-slate-400'}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-white shadow-soft text-ink' : 'text-slate-400'}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden sm:block" />

          <button
            onClick={undo}
            disabled={history.length === 0}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Annuler"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Rétablir"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-slate-200" />

          <Button variant="outline" size="sm" onClick={handleSave} loading={saving} icon={<Save className="h-3.5 w-3.5" />}>
            Enregistrer
          </Button>
          <div className="relative">
            <Button size="sm" onClick={() => setPublishOpen(!publishOpen)} icon={<Send className="h-3.5 w-3.5" />}>
              Publier
              <ChevronDown className="h-3 w-3" />
            </Button>
            {publishOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPublishOpen(false)} />
                <div className="absolute right-0 top-10 z-50 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-float border border-slate-100 p-4 animate-scale-in">
                  <p className="text-sm font-semibold mb-1">Publier votre boutique</p>
                  <p className="text-xs text-slate-400 mb-3">
                    Votre dernier design sera mis en ligne sur votre vitrine publique.
                  </p>
                  <Button size="sm" className="w-full" onClick={handlePublish} loading={publishing} icon={<Check className="h-3.5 w-3.5" />}>
                    Publier maintenant
                  </Button>
                  <button
                    onClick={() => { navigate(`/store/${store.slug}`); setPublishOpen(false); }}
                    className="w-full mt-2 text-xs text-slate-500 hover:text-ink py-1.5"
                  >
                    Aperçu de la vitrine →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Builder body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Block library */}
        <div className="w-48 lg:w-56 bg-white border-r border-slate-100 overflow-y-auto scrollbar-thin shrink-0 hidden md:block">
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Blocs</p>
            <div className="space-y-1.5">
              {BLOCK_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleAddBlock(item.type)}
                  draggable
                  onDragStart={() => handleDragStart(item.type)}
                  className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-turquoise-50 flex items-center justify-center text-slate-400 group-hover:text-turquoise-500 transition-colors shrink-0">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                  </div>
                  <Plus className="h-3 w-3 text-slate-300 group-hover:text-turquoise-400 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-cream">
          <div className="py-6 px-4 flex justify-center">
            <div
              className={classNames(
                'bg-white rounded-2xl shadow-float transition-all duration-300',
                device === 'mobile' ? 'w-[375px]' : 'w-full max-w-3xl'
              )}
            >
              {/* Mobile blocks list for add */}
              <div className="md:hidden p-3 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                {BLOCK_LIBRARY.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddBlock(item.type)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 shrink-0"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>

              {blocks.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    icon={<Layout className="h-7 w-7" />}
                    title="Votre toile est vide"
                    description="Faites glisser ou cliquez sur les blocs de gauche pour construire votre vitrine."
                  />
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-4">
                  {blocks.map((block, idx) => (
                    <BlockWrapper
                      key={block.id}
                      block={block}
                      selected={selectedId === block.id}
                      onSelect={() => setSelectedId(block.id)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onDuplicate={() => handleDuplicateBlock(block.id)}
                      onMoveUp={() => handleMoveBlock(block.id, 'up')}
                      onMoveDown={() => handleMoveBlock(block.id, 'down')}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < blocks.length - 1}
                      onDragStart={() => handleDragStart(block.id)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      isDragOver={dragOverIdx === idx}
                      theme={theme}
                      storeId={store.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="w-64 lg:w-72 bg-white border-l border-slate-100 overflow-y-auto scrollbar-thin shrink-0 hidden lg:block">
          {selectedBlock ? (
            <BlockInspector
              block={selectedBlock}
              theme={theme}
              onUpdate={(patch) => handleUpdateBlock(selectedBlock.id, patch)}
              onUpdateTheme={updateTheme}
            />
          ) : (
            <ThemeInspector theme={theme} onUpdate={updateTheme} />
          )}
        </div>
      </div>
    </div>
  );
}

function BlockWrapper({
  block,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  theme,
  storeId,
}: {
  block: StorefrontBlock;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragOver: boolean;
  theme: StorefrontTheme;
  storeId: string;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={classNames(
        'relative rounded-xl border-2 transition-all cursor-pointer group',
        selected ? 'border-turquoise-400 ring-4 ring-turquoise-400/15' : 'border-transparent hover:border-slate-200',
        isDragOver && 'border-turquoise-400 border-dashed'
      )}
    >
      {/* Block toolbar */}
      <div className={classNames(
        'absolute -top-3 right-2 flex items-center gap-0.5 bg-white rounded-lg shadow-soft border border-slate-100 px-1 py-0.5 transition-opacity z-10',
        selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}>
        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={!canMoveUp} className="p-1 text-slate-400 hover:text-ink disabled:opacity-30">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={!canMoveDown} className="p-1 text-slate-400 hover:text-ink disabled:opacity-30">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 text-slate-400 hover:text-ink">
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-slate-400 hover:text-red-500">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drag handle */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white rounded-lg shadow-soft border border-slate-100 p-1 text-slate-300">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <BlockPreview block={block} theme={theme} storeId={storeId} />
      </div>
    </div>
  );
}

function BlockPreview({ block, theme, storeId }: { block: StorefrontBlock; theme: StorefrontTheme; storeId: string }) {
  switch (block.type) {
    case 'hero':
      return (
        <div className="p-8 text-center" style={{ background: block.bg }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: theme.headingFont }}>{block.title}</h2>
          <p className="text-sm text-slate-500 mb-4">{block.subtitle}</p>
          <span className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: theme.accent }}>
            {block.ctaText}
          </span>
        </div>
      );
    case 'products':
      return <ProductPreviewBlock block={block} theme={theme} storeId={storeId} />;
    case 'features':
      return (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center" style={{ fontFamily: theme.headingFont }}>{block.title}</h3>
          <div className="grid grid-cols-3 gap-3">
            {block.items.map((item, i) => (
              <div key={i} className="text-center">
                <div className="h-10 w-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${theme.primary}20`, color: theme.primary }}>
                  <span className="text-xs font-bold">{item.title.slice(0, 2)}</span>
                </div>
                <p className="text-xs font-semibold mb-1">{item.title}</p>
                <p className="text-[10px] text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'text':
      return (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: theme.headingFont }}>{block.title}</h3>
          <p className="text-sm text-slate-500">{block.body}</p>
        </div>
      );
    case 'image':
      return (
        <div className="p-2">
          {block.src ? (
            <img src={block.src} alt={block.caption} className={`w-full h-48 object-cover ${block.rounded ? 'rounded-xl' : ''}`} />
          ) : (
            <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <Image className="h-8 w-8" />
            </div>
          )}
          {block.caption && <p className="text-xs text-slate-400 text-center mt-2">{block.caption}</p>}
        </div>
      );
    case 'banner':
      return (
        <div className="p-3 text-center text-white text-sm font-semibold" style={{ background: block.bg }}>
          {block.text}
        </div>
      );
  }
}

function ProductPreviewBlock({ block, theme, storeId }: { block: Extract<StorefrontBlock, { type: 'products' }>; theme: StorefrontTheme; storeId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    listPublishedProducts(storeId).then(setProducts).catch(() => {});
  }, [storeId]);
  const shown = products.slice(0, block.limit);
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: theme.headingFont }}>{block.title}</h3>
      {shown.length === 0 ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}>
          {Array.from({ length: Math.min(block.limit, block.columns * 2) }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
              <ShoppingBag className="h-6 w-6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}>
          {shown.map((p) => (
            <div key={p.id} className="rounded-lg overflow-hidden border border-slate-100">
              <div className="aspect-[4/3] bg-slate-100">
                {p.cover_url && <img src={p.cover_url} alt={p.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold truncate">{p.title}</p>
                <p className="text-xs font-bold" style={{ color: theme.primary }}>${(p.price_cents / 100).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockInspector({
  block,
  theme,
  onUpdate,
  onUpdateTheme,
}: {
  block: StorefrontBlock;
  theme: StorefrontTheme;
  onUpdate: (patch: Partial<StorefrontBlock>) => void;
  onUpdateTheme: (patch: Partial<StorefrontTheme>) => void;
}) {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Réglages du bloc</p>
      <p className="text-sm font-semibold capitalize mb-4">bloc {block.type}</p>

      {block.type === 'hero' && (
        <div className="space-y-3">
          <Field label="Titre"><input className="input" value={block.title} onChange={(e) => onUpdate({ title: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Sous-titre"><textarea className="input min-h-[60px]" value={block.subtitle} onChange={(e) => onUpdate({ subtitle: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Texte du bouton"><input className="input" value={block.ctaText} onChange={(e) => onUpdate({ ctaText: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Couleur de fond"><ColorInput value={block.bg} onChange={(v) => onUpdate({ bg: v } as Partial<StorefrontBlock>)} /></Field>
        </div>
      )}

      {block.type === 'products' && (
        <div className="space-y-3">
          <Field label="Titre"><input className="input" value={block.title} onChange={(e) => onUpdate({ title: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Nombre max de produits"><input type="number" className="input" value={block.limit} onChange={(e) => onUpdate({ limit: parseInt(e.target.value) || 6 } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Colonnes">
            <select className="input" value={block.columns} onChange={(e) => onUpdate({ columns: parseInt(e.target.value) || 3 } as Partial<StorefrontBlock>)}>
              <option value={2}>2 colonnes</option>
              <option value={3}>3 colonnes</option>
              <option value={4}>4 colonnes</option>
            </select>
          </Field>
        </div>
      )}

      {block.type === 'features' && (
        <div className="space-y-3">
          <Field label="Titre"><input className="input" value={block.title} onChange={(e) => onUpdate({ title: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <p className="text-xs font-semibold text-slate-400 pt-2">Atouts</p>
          {block.items.map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-50 p-3 space-y-2">
              <input className="input text-sm" value={item.title} placeholder="Titre" onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...item, title: e.target.value };
                onUpdate({ items } as Partial<StorefrontBlock>);
              }} />
              <input className="input text-sm" value={item.text} placeholder="Description" onChange={(e) => {
                const items = [...block.items];
                items[i] = { ...item, text: e.target.value };
                onUpdate({ items } as Partial<StorefrontBlock>);
              }} />
            </div>
          ))}
        </div>
      )}

      {block.type === 'text' && (
        <div className="space-y-3">
          <Field label="Titre"><input className="input" value={block.title} onChange={(e) => onUpdate({ title: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Corps du texte"><textarea className="input min-h-[120px]" value={block.body} onChange={(e) => onUpdate({ body: e.target.value } as Partial<StorefrontBlock>)} /></Field>
        </div>
      )}

      {block.type === 'image' && (
        <div className="space-y-3">
          <Field label="URL de l'image"><input className="input" value={block.src} onChange={(e) => onUpdate({ src: e.target.value } as Partial<StorefrontBlock>)} placeholder="https://..." /></Field>
          <Field label="Légende"><input className="input" value={block.caption} onChange={(e) => onUpdate({ caption: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={block.rounded} onChange={(e) => onUpdate({ rounded: e.target.checked } as Partial<StorefrontBlock>)} className="rounded" />
            Coins arrondis
          </label>
        </div>
      )}

      {block.type === 'banner' && (
        <div className="space-y-3">
          <Field label="Texte"><input className="input" value={block.text} onChange={(e) => onUpdate({ text: e.target.value } as Partial<StorefrontBlock>)} /></Field>
          <Field label="Couleur de fond"><ColorInput value={block.bg} onChange={(v) => onUpdate({ bg: v } as Partial<StorefrontBlock>)} /></Field>
        </div>
      )}
    </div>
  );
}

function ThemeInspector({ theme, onUpdate }: { theme: StorefrontTheme; onUpdate: (patch: Partial<StorefrontTheme>) => void }) {
  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thème</p>
      <p className="text-sm text-slate-400 mb-4">Sélectionnez un bloc pour le modifier, ou ajustez votre thème ci-dessous.</p>
      <div className="space-y-4">
        <Field label="Couleur principale"><ColorInput value={theme.primary} onChange={(v) => onUpdate({ primary: v })} /></Field>
        <Field label="Couleur d'accent"><ColorInput value={theme.accent} onChange={(v) => onUpdate({ accent: v })} /></Field>
        <Field label="Rayon des coins">
          <input type="range" min={0} max={32} value={theme.radius} onChange={(e) => onUpdate({ radius: parseInt(e.target.value) })} className="w-full" />
          <p className="text-xs text-slate-400 mt-1">{theme.radius}px</p>
        </Field>
        <Field label="Disposition">
          <select className="input" value={theme.layout} onChange={(e) => onUpdate({ layout: e.target.value as 'centered' | 'full' })}>
            <option value="centered">Centrée</option>
            <option value="full">Pleine largeur</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input flex-1 font-mono text-sm"
      />
    </div>
  );
}
