import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import { initials } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Megaphone,
  BarChart3, Palette, Wand2, Settings, LogOut, Menu, X, ExternalLink,
  Sparkles, Store as StoreIcon, ChevronDown,
} from 'lucide-react';
import { classNames } from '@/lib/utils';

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  to: string;
};

const NAV: NavItem[] = [
  { label: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Produits', icon: Package, to: '/dashboard/products' },
  { label: 'Commandes', icon: ShoppingBag, to: '/dashboard/orders' },
  { label: 'Clients', icon: Users, to: '/dashboard/customers' },
  { label: 'Coupons', icon: Tag, to: '/dashboard/coupons' },
  { label: 'Marketing', icon: Megaphone, to: '/dashboard/marketing' },
  { label: 'Analyses', icon: BarChart3, to: '/dashboard/analytics' },
  { label: 'Éditeur de boutique', icon: Palette, to: '/dashboard/builder' },
  { label: 'AI Mock Studio', icon: Wand2, to: '/dashboard/ai-studio' },
  { label: 'Paramètres', icon: Settings, to: '/dashboard/settings' },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const { store } = useStore();
  const { path, navigate } = useRouter();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast('Déconnexion réussie');
    navigate('/');
  };

  const handleNav = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar - desktop */}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-slate-100 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:shadow-card',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight">Digitalia</span>
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Store switcher */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={() => handleNav('/dashboard/settings')}
            className="w-full flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-lg bg-turquoise-50 flex items-center justify-center shrink-0">
              {store?.logo_url ? (
                <img src={store.logo_url} alt="" className="h-full w-full rounded-lg object-cover" />
              ) : (
                <StoreIcon className="h-4 w-4 text-turquoise-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{store?.name || 'Votre boutique'}</p>
              <p className="text-xs text-slate-400 truncate">digitalia.store/{store?.slug || '...'}</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <div className="space-y-0.5">
            {NAV.map((item) => {
              const isActive =
                item.to === '/dashboard'
                  ? path === '/dashboard'
                  : path.startsWith(item.to);
              return (
                <button
                  key={item.to}
                  onClick={() => handleNav(item.to)}
                  className={classNames('nav-link w-full', isActive && 'nav-link-active')}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User menu */}
        <div className="p-3 border-t border-slate-100 relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-turquoise-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials(profile?.full_name || user?.email)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold truncate">{profile?.full_name || 'Compte'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute bottom-16 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl shadow-float border border-slate-100 py-1.5 z-50 animate-scale-in">
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:pl-64 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden h-14 bg-white/85 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-soft">
          <button onClick={() => setMobileOpen(true)} className="text-slate-500 hover:text-ink">
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">Digitalia</span>
          </button>
          <button
            onClick={() => store && navigate(`/store/${store.slug}`)}
            className="text-slate-400 hover:text-ink"
            disabled={!store}
          >
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex h-14 bg-white/80 backdrop-blur-sm border-b border-slate-100 items-center justify-between px-6 sticky top-0 z-30">
          <p className="text-sm text-slate-400">
            Bon retour, <span className="font-semibold text-ink">{profile?.full_name?.split(' ')[0] || 'à vous'}</span>
          </p>
          {store && (
            <button
              onClick={() => navigate(`/store/${store.slug}`)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink transition-colors"
            >
              Voir la boutique
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <main className="p-5 lg:p-8 max-w-container mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function DashboardPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-h3">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
