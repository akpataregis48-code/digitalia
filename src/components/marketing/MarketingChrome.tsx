import { useState } from 'react';
import { useRouter } from '@/lib/router';
import { Sparkles, Menu, X } from 'lucide-react';

export function MarketingHeader() {
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-slate-100 shadow-soft">
      <div className="max-w-container mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center shadow-soft">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">Digitalia</span>
        </button>

        <nav className="hidden md:flex items-center gap-7">
          <button onClick={() => navigate('/#features')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">Fonctionnalités</button>
          <button onClick={() => navigate('/#builder')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">Éditeur</button>
          <button onClick={() => navigate('/#pricing')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">Tarifs</button>
          <button onClick={() => navigate('/#faq')} className="text-sm font-medium text-slate-500 hover:text-ink transition-colors">FAQ</button>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/signin')} className="btn-ghost btn-sm hidden sm:inline-flex">
            Se connecter
          </button>
          <button onClick={() => navigate('/signup')} className="btn-primary btn-sm">
            Commencer
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-cream/95 backdrop-blur-md px-5 py-4 space-y-1 shadow-lift">
          <button onClick={() => { navigate('/#features'); setOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-500 hover:text-ink py-2 transition-colors">Fonctionnalités</button>
          <button onClick={() => { navigate('/#builder'); setOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-500 hover:text-ink py-2 transition-colors">Éditeur</button>
          <button onClick={() => { navigate('/#pricing'); setOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-500 hover:text-ink py-2 transition-colors">Tarifs</button>
          <button onClick={() => { navigate('/#faq'); setOpen(false); }} className="block w-full text-left text-sm font-medium text-slate-500 hover:text-ink py-2 transition-colors">FAQ</button>
          <div className="pt-2 flex gap-2">
            <button onClick={() => { navigate('/signin'); setOpen(false); }} className="btn-ghost btn-sm flex-1">Se connecter</button>
            <button onClick={() => { navigate('/signup'); setOpen(false); }} className="btn-primary btn-sm flex-1">Commencer</button>
          </div>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  const { navigate } = useRouter();

  const cols = [
    {
      title: 'Produit',
      links: [
        { label: 'Fonctionnalités', to: '/#features' },
        { label: 'Éditeur de boutique', to: '/#builder' },
        { label: 'Tarifs', to: '/#pricing' },
        { label: 'AI Mock Studio', to: '/#ai' },
      ],
    },
    {
      title: 'Vendeurs',
      links: [
        { label: 'Commencer à vendre', to: '/signup' },
        { label: 'Se connecter', to: '/signin' },
        { label: 'Tableau de bord', to: '/dashboard' },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { label: 'FAQ', to: '/#faq' },
        { label: 'Parcourir les boutiques', to: '/stores' },
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
              La plateforme tout-en-un pour vendre des produits numériques. Belles vitrines, paiement sécurisé et statistiques puissantes.
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
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Digitalia. Tous droits réservés.</p>
          <p className="text-xs text-slate-400">Créé par des créateurs, pour des créateurs.</p>
        </div>
      </div>
    </footer>
  );
}
