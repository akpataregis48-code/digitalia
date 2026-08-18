import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { Sparkles, ArrowRight, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const { navigate } = useRouter();
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-turquoise-50 via-cream to-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-40" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-turquoise-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 w-fit">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center shadow-soft">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">Digitalia</span>
          </button>
          <div className="max-w-md">
            <h2 className="text-h2 mb-4 text-balance">
              Sell digital products, beautifully
            </h2>
            <p className="text-slate-500 text-balance">
              Store builder, secure checkout, analytics, and AI mock studio — all in one platform built for creators.
            </p>
            <div className="mt-8 space-y-3">
              {['No code required', 'Free forever plan', 'Setup in minutes'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-turquoise-400 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Digitalia</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-5 border-b border-slate-100">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight">Digitalia</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-sm">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink transition-colors mb-6 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>
            <h1 className="text-h3 mb-2">{title}</h1>
            <p className="text-sm text-slate-500 mb-7">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignInPage() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    toast('Welcome back!');
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Sign in to manage your store.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-500 text-center">
        No account yet?{' '}
        <button onClick={() => navigate('/signup')} className="font-semibold text-turquoise-600 hover:text-turquoise-700">
          Create one
        </button>
      </p>
    </AuthLayout>
  );
}

export function SignUpPage() {
  const { signUp } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    toast('Account created! Let us set up your store.');
    navigate('/onboarding');
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start selling digital products in minutes.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input pl-10"
              placeholder="Jane Creator"
              autoComplete="name"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-500 text-center">
        Already have an account?{' '}
        <button onClick={() => navigate('/signin')} className="font-semibold text-turquoise-600 hover:text-turquoise-700">
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

export function SignOutRoute() {
  const { signOut } = useAuth();
  const { navigate } = useRouter();
  signOut().then(() => navigate('/'));
  return null;
}

// Auto-create profile on signup if missing (called from auth context)
export async function ensureProfile(userId: string, email: string, fullName: string) {
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (!data) {
    await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      onboarding_complete: false,
    });
  }
}
