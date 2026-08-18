import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useToast } from '@/lib/toast';
import { listCampaigns, createCampaign, updateCampaign, deleteCampaign, sendCampaign } from '@/lib/data';
import type { MarketingCampaign } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { Card, Badge, Modal, ConfirmDialog, Tabs } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatRelative, formatDate } from '@/lib/utils';
import { Megaphone, Plus, Trash2, Send, Mail, Eye, MousePointerClick, Edit2 } from 'lucide-react';

export function MarketingPage() {
  const { store } = useStore();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'draft' | 'sent'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<MarketingCampaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketingCampaign | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const data = await listCampaigns(store.id);
      setCampaigns(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaigns');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const handleSave = async (data: { name: string; subject: string; body: string; audience: string }, id?: string) => {
    if (!store) return;
    try {
      if (id) {
        await updateCampaign(id, data);
        toast('Campaign updated');
      } else {
        const created = await createCampaign(store.id, data);
        setCampaigns((prev) => [created, ...prev]);
        toast('Campaign created');
      }
      setShowForm(false);
      setEditTarget(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to save', 'error');
    }
  };

  const handleSend = async (campaign: MarketingCampaign) => {
    if (!store) return;
    setSending(campaign.id);
    try {
      await sendCampaign(campaign.id, store.id);
      toast('Campaign sent to your customers');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to send', 'error');
    }
    setSending(null);
  };

  const handleDelete = async (campaign: MarketingCampaign) => {
    try {
      await deleteCampaign(campaign.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      toast('Campaign deleted');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const filtered = campaigns.filter((c) => {
    if (tab === 'draft') return c.status === 'draft';
    if (tab === 'sent') return c.status === 'sent';
    return true;
  });

  if (loading) return <LoadingPage label="Loading campaigns..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader
        title="Marketing"
        description="Email campaigns for your customers"
        action={
          <Button onClick={() => { setEditTarget(null); setShowForm(true); }} icon={<Plus className="h-4 w-4" />}>
            New campaign
          </Button>
        }
      />

      <Tabs
        tabs={[
          { value: 'all', label: 'All', count: campaigns.length },
          { value: 'draft', label: 'Drafts', count: campaigns.filter((c) => c.status === 'draft').length },
          { value: 'sent', label: 'Sent', count: campaigns.filter((c) => c.status === 'sent').length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {filtered.length === 0 ? (
          <Card className="p-0">
            <EmptyState
              icon={<Megaphone className="h-7 w-7" />}
              title={campaigns.length === 0 ? 'No campaigns yet' : 'No matching campaigns'}
              description={campaigns.length === 0 ? 'Create email campaigns to reach your customers.' : 'Try a different tab.'}
              action={campaigns.length === 0 ? <Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>New campaign</Button> : undefined}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((campaign) => (
              <Card key={campaign.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'sent' ? 'success' : 'warning'}>{campaign.status}</Badge>
                    </div>
                    {campaign.subject && <p className="text-sm text-slate-500 mb-2">Subject: {campaign.subject}</p>}
                    {campaign.body && <p className="text-sm text-slate-400 line-clamp-2">{campaign.body}</p>}

                    {campaign.status === 'sent' && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" /> {campaign.sent_count} sent
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-sky-600">
                          <Eye className="h-3.5 w-3.5" /> {campaign.open_count} opens
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-orange-600">
                          <MousePointerClick className="h-3.5 w-3.5" /> {campaign.click_count} clicks
                        </span>
                        <span className="text-xs text-slate-400 ml-auto">{formatRelative(campaign.created_at)}</span>
                      </div>
                    )}
                    {campaign.status === 'draft' && (
                      <p className="text-xs text-slate-400 mt-2">Created {formatDate(campaign.created_at)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {campaign.status === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditTarget(campaign); setShowForm(true); }}
                          icon={<Edit2 className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSend(campaign)}
                          loading={sending === campaign.id}
                          icon={<Send className="h-3.5 w-3.5" />}
                        >
                          Send
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteTarget(campaign)}
                      className="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CampaignFormModal
          campaign={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete campaign?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function CampaignFormModal({
  campaign,
  onClose,
  onSave,
}: {
  campaign: MarketingCampaign | null;
  onClose: () => void;
  onSave: (data: { name: string; subject: string; body: string; audience: string }, id?: string) => void;
}) {
  const [name, setName] = useState(campaign?.name || '');
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [body, setBody] = useState(campaign?.body || '');
  const [audience, setAudience] = useState(campaign?.audience || 'all');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }
    onSave(
      { name: name.trim(), subject: subject.trim(), body: body.trim(), audience },
      campaign?.id
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={campaign ? 'Edit campaign' : 'New campaign'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{campaign ? 'Save changes' : 'Create campaign'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Campaign name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer sale launch" />
        <Input label="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="20% off all templates this week!" />
        <Textarea
          label="Email body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email content here..."
          className="min-h-[160px]"
        />
        <Select
          label="Audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          options={[
            { value: 'all', label: 'All customers' },
            { value: 'repeat', label: 'Repeat customers' },
            { value: 'new', label: 'New customers' },
          ]}
        />
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
