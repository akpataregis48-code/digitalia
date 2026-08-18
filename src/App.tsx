import { useEffect } from 'react';
import { RouterProvider, useRouter, matchRoute } from '@/lib/router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { StoreProvider, useStore } from '@/lib/store-context';
import { ToastProvider } from '@/lib/toast';
import { CartProvider } from '@/lib/cart';
import { LoadingPage } from '@/components/ui/Feedback';

import { LandingPage } from '@/components/marketing/LandingPage';
import { SignInPage, SignUpPage, SignOutRoute } from '@/components/auth/AuthPages';
import { OnboardingPage } from '@/components/onboarding/OnboardingPage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ProductsPage } from '@/components/dashboard/ProductsPage';
import { ProductDetailPage } from '@/components/dashboard/ProductDetailPage';
import { OrdersPage } from '@/components/dashboard/OrdersPage';
import { OrderDetailPage } from '@/components/dashboard/OrderDetailPage';
import { CustomersPage } from '@/components/dashboard/CustomersPage';
import { CouponsPage } from '@/components/dashboard/CouponsPage';
import { MarketingPage } from '@/components/dashboard/MarketingPage';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { StoreBuilderPage } from '@/components/dashboard/StoreBuilderPage';
import { AiMockStudioPage } from '@/components/dashboard/AiMockStudioPage';
import {
  StoreHomePage, StoreProductPage, CartPage, CheckoutPage,
} from '@/components/storefront/PublicPages';
import { StoresBrowsePage } from '@/components/storefront/StoresBrowsePage';

function Redirect({ to }: { to: string }) {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  return null;
}

function AppRoutes() {
  const { path } = useRouter();
  const route = path.split('#')[0];
  const { user, profile, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();

  // Scroll to anchor on hash change
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [path]);

  // Public routes (no auth required)
  if (route === '/') return <LandingPage />;
  if (route === '/stores') return <StoresBrowsePage />;
  if (route === '/signin') {
    if (user) {
      return <Redirect to="/dashboard" />;
    }
    return <SignInPage />;
  }
  if (route === '/signup') {
    if (user) {
      return <Redirect to="/dashboard" />;
    }
    return <SignUpPage />;
  }
  if (route === '/signout') return <SignOutRoute />;

  // Public storefront routes
  let match = matchRoute('/store/:slug', route);
  if (match) return <StoreHomePage slug={match.slug} />;
  match = matchRoute('/store/:slug/product/:productSlug', route);
  if (match) return <StoreProductPage slug={match.slug} productSlug={match.productSlug} />;
  match = matchRoute('/store/:slug/cart', route);
  if (match) return <CartPage slug={match.slug} />;
  match = matchRoute('/store/:slug/checkout', route);
  if (match) return <CheckoutPage slug={match.slug} />;

  // Protected routes
  if (authLoading || (user && storeLoading)) {
    return <LoadingPage label="Loading..." />;
  }

  if (!user) {
    return <Redirect to="/signin" />;
  }

  // Onboarding check
  if (profile && !profile.onboarding_complete && route !== '/onboarding') {
    return <Redirect to="/onboarding" />;
  }

  if (route === '/onboarding') return <OnboardingPage />;

  // Dashboard routes (require store)
  if (route.startsWith('/dashboard')) {
    if (!store && !storeLoading) {
      return <Redirect to="/onboarding" />;
    }
    if (!store) return <LoadingPage label="Loading store..." />;

    // Store Builder is full-screen, no dashboard chrome
    if (route === '/dashboard/builder') return <StoreBuilderPage />;

    let dashMatch: Record<string, string> | null;

    dashMatch = matchRoute('/dashboard/products/:productId', route);
    if (dashMatch) {
      return (
        <DashboardLayout>
          <ProductDetailPage productId={dashMatch.productId} />
        </DashboardLayout>
      );
    }
    dashMatch = matchRoute('/dashboard/orders/:orderId', route);
    if (dashMatch) {
      return (
        <DashboardLayout>
          <OrderDetailPage orderId={dashMatch.orderId} />
        </DashboardLayout>
      );
    }

    const pages: Record<string, React.ReactNode> = {
      '/dashboard': <DashboardOverview />,
      '/dashboard/products': <ProductsPage />,
      '/dashboard/orders': <OrdersPage />,
      '/dashboard/customers': <CustomersPage />,
      '/dashboard/coupons': <CouponsPage />,
      '/dashboard/marketing': <MarketingPage />,
      '/dashboard/analytics': <AnalyticsPage />,
      '/dashboard/ai-studio': <AiMockStudioPage />,
      '/dashboard/settings': <SettingsPage />,
    };

    const content = pages[route];
    if (content) {
      return <DashboardLayout>{content}</DashboardLayout>;
    }

    // Default to overview for /dashboard*
    return <DashboardLayout><DashboardOverview /></DashboardLayout>;
  }

  // Fallback
  return <Redirect to="/" />;
}

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </RouterProvider>
  );
}
