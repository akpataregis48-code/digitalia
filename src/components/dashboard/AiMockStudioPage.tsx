import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store-context';
import { useToast } from '@/lib/toast';
import {
  listAiMocks, createAiMock, updateAiMock, deleteAiMock,
} from '@/lib/data';
import type { AiMock } from '@/lib/types';
import { DashboardPageHeader } from './DashboardLayout';
import { Button, Input, Select } from '@/components/ui';
import { Card, Badge, ConfirmDialog } from '@/components/ui';
import { LoadingPage, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { formatRelative } from '@/lib/utils';
import { Wand2, Sparkles, Trash2, Download, Copy, Check } from 'lucide-react';

const STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'playful', label: 'Playful' },
  { value: 'bold', label: 'Bold' },
  { value: 'soft', label: 'Soft' },
];

const PROMPT_IDEAS = [
  'A clean ebook cover about productivity',
  'Premium 3D icon set for a SaaS app',
  'Gradient background for a course landing page',
  'Abstract geometric pattern for templates',
  'Soft watercolor texture for invitation designs',
];

// Deterministic gradient generator from a prompt string (no external API)
function generateMockImage(prompt: string, style: string): string {
  const hash = Array.from(prompt + style).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffffff, 1);
  const palettes: Record<string, [string, string, string]> = {
    minimal: ['#F7F9F8', '#DCE4E1', '#8A9893'],
    gradient: ['#45C7B2', '#55BFF5', '#FF8A3D'],
    editorial: ['#111111', '#4F5553', '#FF8A3D'],
    playful: ['#FF8A3D', '#45C7B2', '#55BFF5'],
    bold: ['#111111', '#FF8A3D', '#45C7B2'],
    soft: ['#EAFBF6', '#EAF7FE', '#FFF1E8'],
  };
  const [c1, c2, c3] = palettes[style] || palettes.gradient;
  const angle = hash % 360;
  const cx = 20 + (hash % 60);
  const cy = 20 + ((hash >> 4) % 60);
  const r = 30 + ((hash >> 8) % 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
      <radialGradient id="r" cx="${cx}%" cy="${cy}%" r="${r}%">
        <stop offset="0%" stop-color="${c3}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <rect width="400" height="300" fill="url(#r)"/>
    <circle cx="${100 + (hash % 200)}" cy="${80 + ((hash >> 4) % 140)}" r="${20 + (hash % 40)}" fill="white" fill-opacity="0.15"/>
    <circle cx="${50 + ((hash >> 8) % 300)}" cy="${150 + ((hash >> 12) % 100)}" r="${10 + (hash % 30)}" fill="white" fill-opacity="0.1"/>
    <text x="200" y="170" font-family="Manrope, sans-serif" font-size="16" font-weight="700" fill="white" fill-opacity="0.9" text-anchor="middle">${prompt.slice(0, 30)}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function AiMockStudioPage() {
  const { store } = useStore();
  const toast = useToast();
  const [mocks, setMocks] = useState<AiMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('gradient');
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AiMock | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const load = async () => {
    if (!store) return;
    try {
      setError(null);
      const data = await listAiMocks(store.id);
      setMocks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load mocks');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [store]);

  const handleGenerate = async () => {
    if (!store) return;
    if (!prompt.trim()) {
      toast('Enter a prompt first', 'error');
      return;
    }
    setGenerating(true);
    try {
      const mock = await createAiMock(store.id, prompt.trim(), style);
      setMocks((prev) => [mock, ...prev]);

      // Simulate generation
      await new Promise((r) => setTimeout(r, 1500));
      const resultUrl = generateMockImage(prompt.trim(), style);
      const updated = await updateAiMock(mock.id, { status: 'completed', result_url: resultUrl });
      setMocks((prev) => prev.map((m) => (m.id === mock.id ? updated : m)));
      toast('Mockup generated');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to generate', 'error');
    }
    setGenerating(false);
  };

  const handleDelete = async (mock: AiMock) => {
    try {
      await deleteAiMock(mock.id);
      setMocks((prev) => prev.filter((m) => m.id !== mock.id));
      toast('Mockup deleted');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete', 'error');
    }
  };

  const handleCopyPrompt = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopiedPrompt(p);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  if (loading) return <LoadingPage label="Loading studio..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <DashboardPageHeader
        title="AI Mock Studio"
        description="Generate product mockups from text prompts"
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Generator */}
        <Card className="p-5 lg:sticky lg:top-24 h-fit">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-turquoise-400 to-orange-400 flex items-center justify-center">
              <Wand2 className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Generate mockup</h3>
              <p className="text-xs text-slate-400">Describe what you want</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input min-h-[80px] resize-y"
                placeholder="A clean ebook cover about productivity..."
              />
            </div>
            <Select
              label="Style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              options={STYLES}
            />

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Prompt ideas</p>
              <div className="space-y-1.5">
                {PROMPT_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    onClick={() => setPrompt(idea)}
                    className="block w-full text-left text-xs text-slate-500 hover:text-turquoise-600 hover:bg-turquoise-50 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              loading={generating}
              disabled={generating}
              className="w-full"
              icon={!generating ? <Sparkles className="h-4 w-4" /> : undefined}
            >
              {generating ? 'Generating...' : 'Generate mockup'}
            </Button>
          </div>
        </Card>

        {/* Gallery */}
        <div className="lg:col-span-2">
          {mocks.length === 0 ? (
            <Card className="p-0">
              <EmptyState
                icon={<Wand2 className="h-7 w-7" />}
                title="No mockups yet"
                description="Write a prompt and generate your first AI mockup. It will appear here."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mocks.map((mock) => (
                <Card key={mock.id} className="p-4 group">
                  <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden mb-3 relative">
                    {mock.status === 'completed' && mock.result_url ? (
                      <img src={mock.result_url} alt={mock.prompt} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <div className="text-center">
                          <div className="h-8 w-8 border-2 border-turquoise-200 border-t-turquoise-400 rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Generating...</p>
                        </div>
                      </div>
                    )}
                    {mock.status === 'completed' && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {mock.result_url && (
                          <a
                            href={mock.result_url}
                            download={`mockup-${mock.id}.svg`}
                            className="h-7 w-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-ink shadow-soft"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(mock)}
                          className="h-7 w-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-400 hover:text-red-500 shadow-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2 mb-1">{mock.prompt}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={mock.status === 'completed' ? 'success' : 'warning'}>
                      {mock.status}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 capitalize">{mock.style}</span>
                      <button
                        onClick={() => handleCopyPrompt(mock.prompt)}
                        className="text-slate-300 hover:text-turquoise-500 transition-colors"
                      >
                        {copiedPrompt === mock.prompt ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{formatRelative(mock.created_at)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete mockup?"
        message="This mockup will be permanently deleted."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
