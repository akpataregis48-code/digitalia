import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store-context';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import { createStore, ensureStorefront } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { Sparkles, ArrowRight, ArrowLeft, Check, Store, Globe, Tag } from 'lucide-react';

const CATEGORIES = ['Ebooks', 'Courses', 'Templates', 'Presets', 'Music', 'Software', 'Design', 'Photography', 'Other'];

export function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const { refresh: refreshStore } = useStore();
  const { navigate } = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Templates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Store name', 'Store details', 'Category'];

  const handleSlugChange = (value: string) => {
    setSlug(slugify(value));
  };

  const handleNext = () => {
    if (step === 0 && !storeName.trim()) {
      setError('Please enter a store name');
      return;
    }
    if (step === 0 && !slug.trim()) {
      setSlug(slugify(storeName));
    }
    setError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      const finalSlug = slug || slugify(storeName);
      const store = await createStore(user.id, {
        name: storeName,
        slug: finalSlug,
        tagline,
        description,
        contact_email: user.email,
      });
      await ensureStorefront(store.id);
      await updateProfile({ onboarding_complete: true });
      await refreshStore();
      toast('Your store is ready!');
      navigate('/dashboard');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create store';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('That store URL is already taken. Try another.');
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cream to-sky-50">
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="border-b border-slate-100 bg-white/60 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-turquoise-400 to-sky-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold tracking-tight">Digitalia</span>
            </div>
            <p className="text-sm text-slate-400">Step {step + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto w-full px-5 pt-6">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-turquoise-400' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-7 animate-scale-in">
              {step === 0 && (
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-turquoise-50 flex items-center justify-center mb-5">
                    <Store className="h-6 w-6 text-turquoise-500" />
                  </div>
                  <h1 className="text-h3 mb-2">Name your store</h1>
                  <p className="text-sm text-slate-500 mb-6">
                    This is how your store appears to customers. You can change it later.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="label" htmlFor="storeName">Store name</label>
                      <input
                        id="storeName"
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                          setSlug(slugify(e.target.value));
                        }}
                        className="input"
                        placeholder="e.g. Creative Templates Co."
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="slug">Store URL</label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-turquoise-400 focus-within:ring-4 focus-within:ring-turquoise-400/15 transition-all">
                        <span className="pl-3.5 pr-1 text-sm text-slate-400 whitespace-nowrap">digitalia.store/</span>
                        <input
                          id="slug"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          className="flex-1 border-0 bg-transparent px-1 py-3 text-sm focus:outline-none"
                          placeholder="your-shop"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-5">
                    <Globe className="h-6 w-6 text-sky-500" />
                  </div>
                  <h1 className="text-h3 mb-2">Add some details</h1>
                  <p className="text-sm text-slate-500 mb-6">
                    Help customers understand what your store is about.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="label" htmlFor="tagline">Tagline</label>
                      <input
                        id="tagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="input"
                        placeholder="Premium digital products for creators"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input min-h-[90px] resize-y"
                        placeholder="Tell customers what makes your store special..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
                    <Tag className="h-6 w-6 text-orange-500" />
                  </div>
                  <h1 className="text-h3 mb-2">What will you sell?</h1>
                  <p className="text-sm text-slate-500 mb-6">
                    Pick the category that best fits your products.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                          category === cat
                            ? 'bg-turquoise-50 text-turquoise-700 border-2 border-turquoise-400'
                            : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl bg-cream border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-turquoise-100 flex items-center justify-center">
                        <Check className="h-5 w-5 text-turquoise-600" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{storeName || 'Your store'}</p>
                        <p className="text-xs text-slate-400">digitalia.store/{slug || 'your-shop'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <div className="mt-7 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                {step < steps.length - 1 ? (
                  <button onClick={handleNext} className="btn-primary">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={handleFinish} disabled={loading} className="btn-primary">
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Create store
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
