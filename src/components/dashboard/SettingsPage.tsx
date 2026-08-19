import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { useToast } from '@/lib/toast';
import { updateStore } from '@/lib/data';
import { DashboardPageHeader } from './DashboardLayout';
import { Button, Input, Textarea } from '@/components/ui';
import { Card, Badge } from '@/components/ui';
import { LoadingPage } from '@/components/ui/Feedback';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { Store, Globe, Save, ExternalLink, Check } from 'lucide-react';

export function SettingsPage() {
  const { store, refresh } = useStore();
  const { profile, updateProfile } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [published, setPublished] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (store) {
      setName(store.name);
      setSlug(store.slug);
      setTagline(store.tagline || '');
      setDescription(store.description || '');
      setLogoUrl(store.logo_url || '');
      setCoverUrl(store.cover_url || '');
      setContactEmail(store.contact_email || '');
      setPublished(store.published);
    }
    if (profile) {
      setFullName(profile.full_name || '');
    }
    if (store) setLoading(false);
  }, [store, profile]);

  const handleSaveStore = async () => {
    if (!store) return;
    setSaving(true);
    try {
      await updateStore(store.id, {
        name,
        slug: slugify(slug) || store.slug,
        tagline: tagline || null,
        description: description || null,
        logo_url: logoUrl || null,
        cover_url: coverUrl || null,
        contact_email: contactEmail || null,
        published,
      });
await refresh();
      toast('Paramètres de la boutique enregistrés');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de l’enregistrement', 'error');
    }
    setSaving(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      await updateProfile({ full_name: fullName });
      toast('Profil mis à jour');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Échec de la mise à jour', 'error');
    }
  };

  if (loading) return <LoadingPage label="Chargement des paramètres..." />;

  return (
    <div>
      <DashboardPageHeader title="Paramètres" description="Gérez votre boutique et votre compte" />

      <div className="space-y-5 max-w-3xl">
        {/* Store profile */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-turquoise-50 flex items-center justify-center">
              <Store className="h-5 w-5 text-turquoise-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Profil de la boutique</h3>
              <p className="text-sm text-slate-400">Comment votre boutique apparaît publiquement</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Nom de la boutique" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="URL de la boutique" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} prefix={<span className="text-xs text-slate-400">digitalia.store/</span>} />
            </div>
            <Input label="Slogan" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Produits numériques premium" />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="URL du logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
              <Input label="URL de l'image de couverture" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Input label="E-mail de contact" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" />

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm font-semibold">Boutique publiée</p>
                <p className="text-xs text-slate-400">Une fois publiée, votre boutique est visible par tous</p>
              </div>
              <button
                onClick={() => setPublished(!published)}
                className={`relative h-7 w-12 rounded-full transition-colors ${published ? 'bg-turquoise-400' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    published ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveStore} loading={saving} icon={<Save className="h-4 w-4" />}>
                Enregistrer la boutique
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/store/${slug}`)}
                icon={<ExternalLink className="h-4 w-4" />}
              >
                Voir la boutique
              </Button>
              {store?.published ? (
                <Badge variant="success"><Check className="h-3 w-3" /> Publiée</Badge>
              ) : (
                <Badge variant="warning">Non publiée</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <Globe className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Compte</h3>
              <p className="text-sm text-slate-400">Vos informations personnelles</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="E-mail" value={profile?.email || ''} disabled hint="L'e-mail ne peut pas être modifié" />
            <Button onClick={handleSaveProfile} variant="outline" icon={<Save className="h-4 w-4" />}>
              Enregistrer le profil
            </Button>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <Globe className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Account</h3>
              <p className="text-sm text-slate-400">Your personal information</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Email" value={profile?.email || ''} disabled hint="Email cannot be changed" />
            <Button onClick={handleSaveProfile} variant="outline" icon={<Save className="h-4 w-4" />}>
              Save profile
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
