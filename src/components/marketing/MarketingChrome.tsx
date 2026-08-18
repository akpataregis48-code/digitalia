import { useRouter } from '@/lib/router';
import { Sparkles } from 'lucide-react';

export function MarketingHeader() {
  const { navigate } = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-container mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center shadow-soft">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">Digitalia</span>
        </button>

        <nav className="hidden md:flex items-center gap-7">
          <button onClick={() => navigate('/#features')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">Features</button>
          <button onClick={() => navigate('/#builder')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">Store Builder</button>
          <button onClick={() => navigate('/#pricing')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">Pricing</button>
          <button onClick={() => navigate('/#faq')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">FAQ</button>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/signin')} className="btn-ghost btn-sm hidden sm:inline-flex">
            Sign in
          </button>
          <button onClick={() => navigate('/signup')} className="btn-primary btn-sm">
            Start free
          </button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  const { navigate } = useRouter();

  const cols = [
    {
      title: 'Product',
      links: [
        { label: 'Features', to: '/#features' },
        { label: 'Store Builder', to: '/#builder' },
        { label: 'Pricing', to: '/#pricing' },
        { label: 'AI Mock Studio', to: '/#ai' },
      ],
    },
    {
      title: 'Sellers',
      links: [
        { label: 'Start selling', to: '/signup' },
        { label: 'Sign in', to: '/signin' },
        { label: 'Dashboard', to: '/dashboard' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'FAQ', to: '/#faq' },
        { label: 'Browse stores', to: '/stores' },
      ],
    },
  ];

  return (
    <footer className="border-t border-slate-100 bg-cream">
      <div className="max-w-container mx-auto px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight">Digitalia</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              The all-in-one platform to sell digital products. Beautiful storefronts, secure checkout, and powerful analytics.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.to)}
                      className="text-sm text-slate-500 hover:text-ink transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Digitalia. All rights reserved.</p>
          <p className="text-xs text-slate-400">Built for creators, by creators.</p>
        </div>
      </div>
    </footer>
  );
}
