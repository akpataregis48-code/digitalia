import { useRouter } from '@/lib/router';
import { MarketingHeader, MarketingFooter } from './MarketingChrome';
import {
  Sparkles, Store, CreditCard, BarChart3, Palette, Zap, Shield, Download,
  Check, ArrowRight, Layers, Wand2, Globe, ShoppingCart, Users, Tag, TrendingUp,
} from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-turquoise-100/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-container mx-auto px-5 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-turquoise-50 border border-turquoise-100 px-4 py-1.5 mb-6 animate-slide-up">
              <Sparkles className="h-3.5 w-3.5 text-turquoise-500" />
              <span className="text-xs font-semibold text-turquoise-700">Sell digital products, beautifully</span>
            </div>
            <h1 className="text-h1 lg:text-display text-balance animate-slide-up" style={{ animationDelay: '50ms' }}>
              The modern way to sell
              <span className="block text-turquoise-500">digital products</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto text-balance animate-slide-up" style={{ animationDelay: '100ms' }}>
              Launch your store in minutes. Drag-and-drop builder, secure checkout with card, mobile money, and PayPal, real-time analytics, and an AI mock studio — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <button onClick={() => navigate('/signup')} className="btn-primary btn-lg w-full sm:w-auto">
                Start selling free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/stores')} className="btn-outline btn-lg w-full sm:w-auto">
                Browse stores
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400 animate-slide-up" style={{ animationDelay: '200ms' }}>
              No credit card required. Free forever plan.
            </p>
          </div>

          {/* Hero preview */}
          <div className="mt-16 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '250ms' }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-turquoise-100 via-sky-100 to-orange-100 rounded-[2rem] blur-2xl opacity-50" />
              <div className="relative bg-white rounded-3xl shadow-lift border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-300" />
                    <div className="h-3 w-3 rounded-full bg-orange-300" />
                    <div className="h-3 w-3 rounded-full bg-turquoise-300" />
                  </div>
                  <div className="flex-1 mx-3 h-6 rounded-md bg-white border border-slate-200 flex items-center px-3">
                    <span className="text-xs text-slate-400">digitalia.store/your-shop</span>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Revenue', value: '$12,480', color: 'text-turquoise-600' },
                      { label: 'Orders', value: '342', color: 'text-sky-600' },
                      { label: 'Customers', value: '1,205', color: 'text-orange-600' },
                      { label: 'Conversion', value: '4.2%', color: 'text-turquoise-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 p-3">
                        <div className="h-20 rounded-lg bg-gradient-to-br from-turquoise-100 to-sky-100 mb-2" />
                        <div className="h-2.5 w-3/4 bg-slate-100 rounded mb-1.5" />
                        <div className="h-2 w-1/2 bg-slate-50 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / social proof */}
      <section className="border-y border-slate-100 bg-cream py-8">
        <div className="max-w-container mx-auto px-5 lg:px-8">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
            Trusted by 4,000+ digital creators worldwide
          </p>
          <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-4 opacity-60">
            {['Notionly', 'PixelForge', 'SoundLab', 'EbookHub', 'DesignKit', 'CoursePro'].map((name) => (
              <span key={name} className="text-base font-bold text-slate-500 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-container mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-turquoise-600 mb-2">Everything you need</p>
            <h2 className="text-h2 mb-4 text-balance">One platform, every tool to sell digital goods</h2>
            <p className="text-slate-500 text-balance">
              From your first product to your ten-thousandth order, Digitalia handles the hard parts so you can focus on creating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Palette, title: 'Visual store builder', text: 'Drag and drop blocks onto a live canvas. Undo, redo, save drafts, and publish when ready.', accent: 'turquoise' },
              { icon: CreditCard, title: 'Multi-method checkout', text: 'Accept cards, mobile money, and PayPal. Local mock processor with full status tracking.', accent: 'orange' },
              { icon: BarChart3, title: 'Real-time analytics', text: 'Revenue, orders, conversion, and visitor charts. Know what sells and what does not.', accent: 'sky' },
              { icon: Download, title: 'Digital file delivery', text: 'Upload files per product. Customers get secure download links after purchase.', accent: 'turquoise' },
              { icon: Tag, title: 'Coupons & discounts', text: 'Percentage or fixed-amount coupons with usage limits and expiry dates.', accent: 'orange' },
              { icon: Users, title: 'Customer management', text: 'Every buyer is tracked automatically. See lifetime value, order history, and location.', accent: 'sky' },
              { icon: Wand2, title: 'AI mock studio', text: 'Generate product mockups from text prompts. Pick a style, generate, and use it instantly.', accent: 'turquoise' },
              { icon: Zap, title: 'Marketing campaigns', text: 'Email your customers with targeted campaigns. Track opens and clicks.', accent: 'orange' },
              { icon: Shield, title: 'Secure by default', text: 'Row-level security on every table. Your data is isolated and protected.', accent: 'sky' },
            ].map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-card transition-shadow duration-200 group">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                  f.accent === 'turquoise' ? 'bg-turquoise-50 text-turquoise-500' :
                  f.accent === 'sky' ? 'bg-sky-50 text-sky-500' : 'bg-orange-50 text-orange-500'
                }`}>
                  <f.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Builder section */}
      <section id="builder" className="py-24 bg-cream border-y border-slate-100">
        <div className="max-w-container mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600 mb-2">Store Builder</p>
              <h2 className="text-h2 mb-4 text-balance">Design your storefront on a real canvas</h2>
              <p className="text-slate-500 mb-6 text-balance">
                Drag blocks, edit in a live inspector, preview exactly what your customers will see. Undo and redo freely. Save drafts, then publish with one click.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Drag-and-drop hero, products, features, text, image, and banner blocks',
                  'Live inspector with theme colors, fonts, and layout controls',
                  'Undo and redo with full history',
                  'Save drafts and publish when ready',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-turquoise-100 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="h-3 w-3 text-turquoise-600" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Try the builder
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-turquoise-100 to-sky-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white rounded-2xl shadow-lift border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-turquoise-300" />
                  </div>
                  <div className="flex gap-1.5">
                    <button className="text-slate-400 hover:text-ink p-1 rounded"><span className="text-xs">↶</span></button>
                    <button className="text-slate-400 hover:text-ink p-1 rounded"><span className="text-xs">↷</span></button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <span className="text-xs font-medium text-turquoise-600 px-2 py-0.5 rounded bg-turquoise-50">Draft</span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-36 border-r border-slate-100 p-3 space-y-2 bg-slate-50/50">
                    {['Hero', 'Products', 'Features', 'Text', 'Image', 'Banner'].map((b, i) => (
                      <div key={b} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium ${i === 0 ? 'bg-white shadow-soft text-ink' : 'text-slate-400'}`}>
                        <div className="h-3.5 w-3.5 rounded bg-slate-200" />
                        {b}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="rounded-xl bg-turquoise-50 p-4 mb-3">
                      <div className="h-3 w-2/3 bg-turquoise-200 rounded mb-2" />
                      <div className="h-2 w-1/2 bg-turquoise-100 rounded mb-3" />
                      <div className="h-6 w-24 bg-orange-400 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-lg border border-slate-100 p-2">
                          <div className="h-12 bg-slate-100 rounded mb-1.5" />
                          <div className="h-2 w-3/4 bg-slate-100 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Mock Studio */}
      <section id="ai" className="py-24">
        <div className="max-w-container mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-3 bg-gradient-to-br from-orange-100 to-turquoise-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative grid grid-cols-2 gap-3">
                {[
                  { from: 'from-turquoise-100', to: 'to-sky-100' },
                  { from: 'from-orange-100', to: 'to-turquoise-100' },
                  { from: 'from-sky-100', to: 'to-orange-100' },
                  { from: 'from-turquoise-100', to: 'to-orange-100' },
                ].map((g, i) => (
                  <div key={i} className={`aspect-square rounded-2xl bg-gradient-to-br ${g.from} ${g.to} border border-white shadow-soft flex items-center justify-center`}>
                    <Wand2 className="h-8 w-8 text-white/70" />
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold text-turquoise-600 mb-2">AI Mock Studio</p>
              <h2 className="text-h2 mb-4 text-balance">Generate product mockups with AI</h2>
              <p className="text-slate-500 mb-6 text-balance">
                Describe what you want, pick a style, and generate mockups for your digital products. No design tools required.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Text-to-mockup generation in seconds',
                  'Multiple visual styles to choose from',
                  'Use generated images as product covers instantly',
                  'All your mockups saved in one library',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="h-3 w-3 text-orange-600" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Try the studio
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-cream border-y border-slate-100">
        <div className="max-w-container mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-orange-600 mb-2">Pricing</p>
            <h2 className="text-h2 mb-4 text-balance">Simple pricing that grows with you</h2>
            <p className="text-slate-500 text-balance">Start free. Upgrade when you are ready. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: 'forever',
                features: ['1 store', 'Up to 10 products', 'Store builder', 'Mock checkout', 'Basic analytics'],
                cta: 'Start free',
                highlight: false,
              },
              {
                name: 'Creator',
                price: '$19',
                period: 'per month',
                features: ['1 store', 'Unlimited products', 'Store builder', 'Coupons & marketing', 'Full analytics', 'AI mock studio'],
                cta: 'Start 14-day trial',
                highlight: true,
              },
              {
                name: 'Business',
                price: '$49',
                period: 'per month',
                features: ['3 stores', 'Unlimited products', 'Everything in Creator', 'Priority support', 'Custom domains', 'Team seats'],
                cta: 'Start 14-day trial',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-7 ${
                  plan.highlight
                    ? 'bg-white border-2 border-turquoise-400 shadow-lift'
                    : 'bg-white border border-slate-100 shadow-soft'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-turquoise-400 text-white px-3 py-1">Most popular</span>
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-slate-400">/ {plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-turquoise-500 mt-0.5 shrink-0" strokeWidth={3} />
                      <span className="text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/signup')}
                  className={plan.highlight ? 'btn-primary w-full' : 'btn-outline w-full'}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-sky-600 mb-2">FAQ</p>
            <h2 className="text-h2 mb-4">Questions, answered</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'What kinds of digital products can I sell?', a: 'Ebooks, courses, templates, presets, music, software, design assets, and any other downloadable file. If it is digital, you can sell it on Digitalia.' },
              { q: 'How does checkout work?', a: 'Digitalia uses a local mock payment processor that simulates Card, Mobile Money, and PayPal. Every payment status (success, failed, declined, pending, timeout, cancelled, refunded, insufficient funds) is fully supported and tracked.' },
              { q: 'Do I need to know how to code?', a: 'No. The Store Builder is fully visual — drag blocks, edit them in the inspector, preview live, and publish with one click.' },
              { q: 'Can I customize my storefront?', a: 'Yes. You control the theme colors, fonts, layout, and the exact blocks that appear. The canvas shows exactly what customers will see.' },
              { q: 'Is there a free plan?', a: 'Yes, the Starter plan is free forever and includes up to 10 products, the store builder, and mock checkout.' },
            ].map((item) => (
              <div key={item.q} className="card p-5">
                <h3 className="text-base font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-turquoise-50 via-white to-sky-50 border-t border-slate-100">
        <div className="max-w-container mx-auto px-5 lg:px-8 text-center">
          <h2 className="text-h2 mb-4 text-balance">Ready to start selling?</h2>
          <p className="text-slate-500 mb-7 max-w-lg mx-auto text-balance">
            Join thousands of creators selling digital products with Digitalia. Set up your store in minutes.
          </p>
          <button onClick={() => navigate('/signup')} className="btn-primary btn-lg">
            Create your store
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
