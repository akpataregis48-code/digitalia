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
              <span className="text-xs font-semibold text-turquoise-700">Vendez vos produits numériques, en toute beauté</span>
            </div>
            <h1 className="text-h1 lg:text-display text-balance animate-slide-up" style={{ animationDelay: '50ms' }}>
              La façon moderne de vendre des{' '}
              <span className="block text-turquoise-500">produits numériques</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto text-balance animate-slide-up" style={{ animationDelay: '100ms' }}>
              Lancez votre boutique en quelques minutes. Éditeur glisser-déposer, paiement sécurisé par carte, mobile money et PayPal, statistiques en temps réel et studio IA — le tout au même endroit.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <button onClick={() => navigate('/signup')} className="btn-primary btn-lg w-full sm:w-auto">
                Commencer à vendre gratuitement
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/stores')} className="btn-outline btn-lg w-full sm:w-auto">
                Découvrir les boutiques
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400 animate-slide-up" style={{ animationDelay: '200ms' }}>
              Sans carte bancaire. Offre gratuite pour toujours.
            </p>
          </div>

          {/* Hero preview */}
          <div className="mt-16 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '250ms' }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-turquoise-100 via-sky-100 to-orange-100 rounded-[2rem] blur-2xl opacity-50" />
              <div className="relative bg-white rounded-3xl shadow-float border border-slate-100 overflow-hidden">
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
                      { label: 'Revenus', value: '$12,480', color: 'text-turquoise-600' },
                      { label: 'Commandes', value: '342', color: 'text-sky-600' },
                      { label: 'Clients', value: '1,205', color: 'text-orange-600' },
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
            Plus de 4 000 créateurs de produits numériques nous font confiance
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
            <p className="text-sm font-semibold text-turquoise-600 mb-2">Tout ce qu'il vous faut</p>
            <h2 className="text-h2 mb-4 text-balance">Une plateforme, tous les outils pour vendre vos produits numériques</h2>
            <p className="text-slate-500 text-balance">
              De votre premier produit à votre dix-millième commande, Digitalia s'occupe des aspects compliqués pour que vous puissiez vous concentrer sur la création.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Palette, title: 'Éditeur de boutique visuel', text: 'Glissez-déposez des blocs sur un canevas en direct. Annulez, répétez, enregistrez des brouillons et publiez quand vous êtes prêt.', accent: 'turquoise' },
              { icon: CreditCard, title: 'Paiement multi-méthodes', text: 'Acceptez cartes, mobile money et PayPal. Processeur de paiement local avec suivi complet des statuts.', accent: 'orange' },
              { icon: BarChart3, title: 'Statistiques en temps réel', text: 'Revenus, commandes, conversion et graphiques de visiteurs. Sachez ce qui se vend et ce qui ne se vend pas.', accent: 'sky' },
              { icon: Download, title: 'Livraison de fichiers numériques', text: 'Joignez des fichiers à chaque produit. Vos clients reçoivent des liens de téléchargement sécurisés après l\u2019achat.', accent: 'turquoise' },
              { icon: Tag, title: 'Coupons et remises', text: 'Coupons en pourcentage ou à montant fixe, avec limites d\u2019utilisation et dates d’expiration.', accent: 'orange' },
              { icon: Users, title: 'Gestion des clients', text: 'Chaque acheteur est suivi automatiquement. Valeur à vie, historique des commandes et localisation.', accent: 'sky' },
              { icon: Wand2, title: 'AI Mock Studio', text: 'Générez des maquettes de produits à partir de descriptions. Choisissez un style, générez, et utilisez-les immédiatement.', accent: 'turquoise' },
              { icon: Zap, title: 'Campagnes marketing', text: 'Envoyez des campagnes ciblées à vos clients par e-mail. Suivez les ouvertures et les clics.', accent: 'orange' },
              { icon: Shield, title: 'Sécurisé par défaut', text: 'Sécurité au niveau des lignes sur chaque table. Vos données sont isolées et protégées.', accent: 'sky' },
            ].map((f) => (
              <div key={f.title} className="card card-hover p-6">
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
              <p className="text-sm font-semibold text-orange-600 mb-2">Éditeur de boutique</p>
              <h2 className="text-h2 mb-4 text-balance">Concevez votre vitrine sur un vrai canevas</h2>
              <p className="text-slate-500 mb-6 text-balance">
                Glissez des blocs, modifiez-les dans un inspecteur en direct, prévisualisez exactement ce que verront vos clients. Annulez et répétez librement. Enregistrez des brouillons, puis publiez en un clic.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Blocs glisser-déposer : héros, produits, fonctionnalités, texte, image et bannière',
                  'Inspecteur en direct : couleurs du thème, polices et réglages de mise en page',
                  'Annuler et répéter avec historique complet',
                  'Enregistrer des brouillons et publier quand vous êtes prêt',
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
                Essayer l'éditeur
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-turquoise-100 to-sky-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white rounded-2xl shadow-float border border-slate-100 overflow-hidden">
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
                    <span className="text-xs font-medium text-turquoise-600 px-2 py-0.5 rounded bg-turquoise-50">Brouillon</span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-36 border-r border-slate-100 p-3 space-y-2 bg-slate-50/50">
                    {['Héros', 'Produits', 'Fonctionnalités', 'Texte', 'Image', 'Bannière'].map((b, i) => (
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
              <h2 className="text-h2 mb-4 text-balance">Générez des maquettes de produits avec l\u2019IA</h2>
              <p className="text-slate-500 mb-6 text-balance">
                Décrivez ce que vous voulez, choisissez un style et générez des maquettes pour vos produits numériques. Aucun outil de design requis.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Génération de maquettes à partir d\u2019un texte en quelques secondes',
                  'Plusieurs styles visuels au choix',
                  'Utilisez les images générées comme couvertures de produits immédiatement',
                  'Toutes vos maquettes conservées dans une bibliothèque',
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
                Essayer le studio
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
            <p className="text-sm font-semibold text-orange-600 mb-2">Tarifs</p>
            <h2 className="text-h2 mb-4 text-balance">Des tarifs simples qui évoluent avec vous</h2>
            <p className="text-slate-500 text-balance">Commencez gratuitement. Passez au niveau supérieur quand vous êtes prêt. Sans frais cachés.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: 'Démarrage',
                price: '$0',
                period: 'pour toujours',
                features: ['1 boutique', 'Jusqu’à 10 produits', 'Éditeur de boutique', 'Paiement de démonstration', 'Statistiques de base'],
                cta: 'Commencer gratuitement',
                highlight: false,
              },
              {
                name: 'Créateur',
                price: '$19',
                period: 'par mois',
                features: ['1 boutique', 'Produits illimités', 'Éditeur de boutique', 'Coupons et marketing', 'Statistiques complètes', 'AI Mock Studio'],
                cta: 'Essai gratuit 14 jours',
                highlight: true,
              },
              {
                name: 'Business',
                price: '$49',
                period: 'par mois',
                features: ['3 boutiques', 'Produits illimités', 'Tout ce qui est inclus dans Créateur', 'Support prioritaire', 'Domaines personnalisés', 'Sièges d\u2019équipe'],
                cta: 'Essai gratuit 14 jours',
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
                    <span className="badge bg-turquoise-400 text-white px-3 py-1">Le plus populaire</span>
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
            <h2 className="text-h2 mb-4">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Quels types de produits numériques puis-je vendre ?', a: 'E-books, cours, modèles, préréglages, musique, logiciels, ressources de design et tout autre fichier téléchargeable. Si c’est numérique, vous pouvez le vendre sur Digitalia.' },
              { q: 'Comment fonctionne le paiement ?', a: 'Digitalia utilise un processeur de paiement local de démonstration qui simule la carte, le mobile money et PayPal. Chaque statut de paiement (succès, échec, refusé, en attente, délai dépassé, annulé, remboursé, fonds insuffisants) est entièrement pris en charge et suivi.' },
              { q: 'Dois-je savoir coder ?', a: 'Non. L\u2019éditeur de boutique est entièrement visuel — glissez des blocs, modifiez-les dans l\u2019inspecteur, prévisualisez en direct et publiez en un clic.' },
              { q: 'Puis-je personnaliser ma vitrine ?', a: 'Oui. Vous contrôlez les couleurs du thème, les polices, la mise en page et les blocs exacts qui apparaissent. Le canevas montre exactement ce que verront vos clients.' },
              { q: 'Existe-t-il un plan gratuit ?', a: 'Oui, le plan Démarrage est gratuit pour toujours et inclut jusqu\u2019à 10 produits, l\u2019éditeur de boutique et le paiement de démonstration.' },
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
          <h2 className="text-h2 mb-4 text-balance">Prêt à commencer à vendre ?</h2>
          <p className="text-slate-500 mb-7 max-w-lg mx-auto text-balance">
            Rejoignez des milliers de créateurs qui vendent des produits numériques avec Digitalia. Créez votre boutique en quelques minutes.
          </p>
          <button onClick={() => navigate('/signup')} className="btn-primary btn-lg">
            Créer votre boutique
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
