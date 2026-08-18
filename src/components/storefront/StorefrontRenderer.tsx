import { useEffect, useState } from 'react';
import type { StorefrontBlock, StorefrontTheme, Product, Store } from '@/lib/types';
import { listPublishedProducts } from '@/lib/data';
import { formatCurrency, classNames } from '@/lib/utils';
import {
  Sparkles, ShoppingBag, Download, ShieldCheck, RefreshCw, Star, Zap, Globe,
  Heart, Lock, Truck, Award, Package, Check, ArrowRight,
} from 'lucide-react';
import { useRouter } from '@/lib/router';

const ICON_MAP: Record<string, typeof Download> = {
  Download, ShieldCheck, RefreshCw, Star, Zap, Globe, Heart, Lock, Truck, Award, Package, Check,
};

export function StorefrontRenderer({
  store,
  theme,
  blocks,
  products,
  onProductClick,
}: {
  store: Store;
  theme: StorefrontTheme;
  blocks: StorefrontBlock[];
  products: Product[];
  onProductClick: (product: Product) => void;
}) {
  return (
    <div style={{ fontFamily: theme.headingFont }}>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          theme={theme}
          products={products}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}

function BlockRenderer({
  block,
  theme,
  products,
  onProductClick,
}: {
  block: StorefrontBlock;
  theme: StorefrontTheme;
  products: Product[];
  onProductClick: (p: Product) => void;
}) {
  switch (block.type) {
    case 'hero':
      return (
        <section className="py-16 sm:py-24 px-5 text-center" style={{ background: block.bg }}>
          <div className={classNames('mx-auto', theme.layout === 'centered' ? 'max-w-3xl' : 'max-w-5xl')}>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: theme.headingFont }}>
              {block.title}
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">{block.subtitle}</p>
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-white font-semibold transition-transform hover:scale-105"
              style={{ background: theme.accent }}
            >
              {block.ctaText}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      );

    case 'products':
      return (
        <section id="products" className="py-16 px-5">
          <div className={classNames('mx-auto', theme.layout === 'centered' ? 'max-w-5xl' : 'max-w-7xl')}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center" style={{ fontFamily: theme.headingFont }}>
              {block.title}
            </h2>
            {products.length === 0 ? (
              <p className="text-center text-slate-400 py-12">No products available yet.</p>
            ) : (
              <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))` }}>
                {products.slice(0, block.limit).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onProductClick(product)}
                    className="text-left group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-card transition-all"
                    style={{ borderRadius: `${theme.radius}px` }}
                  >
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                      {product.cover_url ? (
                        <img src={product.cover_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                          <ShoppingBag className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {product.category && <span className="text-xs font-medium" style={{ color: theme.primary }}>{product.category}</span>}
                      <h3 className="text-base font-semibold mt-1 mb-1 truncate">{product.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold" style={{ color: theme.primary }}>{formatCurrency(product.price_cents)}</span>
                        {product.compare_at_cents && (
                          <span className="text-sm text-slate-400 line-through">{formatCurrency(product.compare_at_cents)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      );

    case 'features':
      return (
        <section className="py-16 px-5 bg-cream">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center" style={{ fontFamily: theme.headingFont }}>
              {block.title}
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {block.items.map((item, i) => {
                const Icon = ICON_MAP[item.icon] || Star;
                return (
                  <div key={i} className="text-center">
                    <div
                      className="h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{ background: `${theme.primary}20`, color: theme.primary }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );

    case 'text':
      return (
        <section className="py-16 px-5">
          <div className={classNames('mx-auto', theme.layout === 'centered' ? 'max-w-2xl' : 'max-w-4xl')}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: theme.headingFont }}>{block.title}</h2>
            <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">{block.body}</p>
          </div>
        </section>
      );

    case 'image':
      return (
        <section className="py-12 px-5">
          <div className={classNames('mx-auto', theme.layout === 'centered' ? 'max-w-3xl' : 'max-w-5xl')}>
            {block.src ? (
              <img
                src={block.src}
                alt={block.caption}
                className="w-full h-auto object-cover"
                style={{ borderRadius: block.rounded ? `${theme.radius}px` : 0 }}
              />
            ) : (
              <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                Image placeholder
              </div>
            )}
            {block.caption && <p className="text-sm text-slate-400 text-center mt-3">{block.caption}</p>}
          </div>
        </section>
      );

    case 'banner':
      return (
        <div className="px-5 py-3 text-center text-white text-sm font-semibold" style={{ background: block.bg }}>
          {block.text}
        </div>
      );
  }
}

export function StorefrontHeader({ store }: { store: Store }) {
  const { navigate } = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => navigate(`/store/${store.slug}`)} className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl overflow-hidden bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center shrink-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold leading-tight">{store.name}</p>
            {store.tagline && <p className="text-xs text-slate-400 leading-tight">{store.tagline}</p>}
          </div>
        </button>
        <button
          onClick={() => navigate('/store/' + store.slug + '/cart')}
          className="relative h-10 w-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-ink transition-colors"
        >
          <ShoppingBag className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function StorefrontFooter({ store }: { store: Store }) {
  return (
    <footer className="border-t border-slate-100 bg-white py-10 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold">{store.name}</p>
              {store.contact_email && <p className="text-xs text-slate-400">{store.contact_email}</p>}
            </div>
          </div>
          <p className="text-xs text-slate-400">Powered by Digitalia</p>
        </div>
      </div>
    </footer>
  );
}
