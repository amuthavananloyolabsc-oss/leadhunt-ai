// src/app/leads/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Globe, Phone, Mail, MapPin, Star, Tag,
  MessageSquare, Send, Copy, CheckCheck, Loader2,
  AlertTriangle, CheckCircle, Pencil, Trash2, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { cn, getLabelColor, getStatusColor, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Lead, OutreachTemplate } from '@/types';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
  { value: 'follow_up', label: 'Follow Up' },
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'instagram' | 'call'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [status, setStatus] = useState('new');

  useEffect(() => {
    Promise.all([
      fetch(`/api/leads/${id}`).then((r) => r.json()),
      fetch(`/api/outreach?leadId=${id}`).then((r) => r.json()),
    ]).then(([leadData, outreachData]) => {
      setLead(leadData);
      setNotes(leadData.notes || '');
      setStatus(leadData.status || 'new');
      setTemplates(outreachData.templates || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success('Status updated');
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
    toast.success('Notes saved');
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    toast.success('Lead deleted');
    router.push('/leads');
  };

  const logOutreach = async (type: string, message: string) => {
    await fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: id, type, message }),
    });
    setStatus('contacted');
    toast.success('Outreach logged');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 size={32} className="animate-spin text-violet-400" />
    </div>
  );

  if (!lead) return (
    <div className="p-8 text-center text-slate-400">
      Lead not found. <Link href="/leads" className="text-violet-400">Go back</Link>
    </div>
  );

  const activeTemplate = templates.find((t) => t.type === activeTab);

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/leads" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Leads
      </Link>

      {/* Header Card */}
      <div className="card-glass p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border-2 shrink-0',
              (lead.aiScore || 0) >= 60
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : (lead.aiScore || 0) >= 30
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-blue-500 text-blue-400 bg-blue-500/10'
            )}>
              {lead.aiScore || 0}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{lead.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={13} />{lead.address || lead.city}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn('badge', getLabelColor(lead.aiLabel || 'cold'))}>
                  {lead.aiLabel === 'hot' ? '🔥' : lead.aiLabel === 'warm' ? '🌡' : '❄'} {lead.aiLabel} priority
                </span>
                <span className="badge bg-slate-700 text-slate-300 border-slate-600">
                  <Tag size={10} /> {lead.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDelete} className="btn-ghost text-red-400 hover:text-red-300">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Status CRM */}
          <div className="card-glass p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CRM Status</h3>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateStatus(opt.value)}
                  className={cn(
                    'text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                    status === opt.value
                      ? getStatusColor(opt.value)
                      : 'text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card-glass p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</h3>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <a href={`tel:${lead.phone}`} className="text-sm text-slate-300 hover:text-white">{lead.phone}</a>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-slate-500 shrink-0" />
                <a href={lead.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 truncate">
                  {lead.website.replace(/https?:\/\//, '').slice(0, 30)}
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
            {lead.rating && (
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-500 shrink-0" />
                <span className="text-sm text-slate-300">
                  {lead.rating} stars ({lead.reviewCount || 0} reviews)
                </span>
              </div>
            )}
            {lead.phone && (
              <a
               href={`https://api.whatsapp.com/send?phone=91${lead.phone.replace(/\D/g, '').slice(-10)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs hover:bg-green-600/30 transition-colors"
              >
                <MessageSquare size={13} /> Open in WhatsApp
              </a>
            )}
          </div>

          {/* Website Analysis */}
          <div className="card-glass p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Website Analysis</h3>
            {!lead.hasWebsite ? (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle size={14} /> No website detected
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Website Score</span>
                  <span className="text-white font-bold">{lead.websiteScore || 'N/A'}/100</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      (lead.websiteScore || 0) >= 70 ? 'bg-emerald-500' :
                      (lead.websiteScore || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${lead.websiteScore || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card-glass p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Pencil size={12} /> Notes
            </h3>
            <textarea
              className="input resize-none h-24 text-xs"
              placeholder="Add notes about this lead…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={saveNotes} disabled={savingNotes} className="btn-secondary text-xs w-full">
              {savingNotes ? <Loader2 size={12} className="animate-spin" /> : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Right column — Outreach */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pitch */}
          {lead.pitchMessage && (
            <div className="card-glass p-4 bg-violet-900/10 border-violet-500/20">
              <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">🎯 Why This Lead</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{lead.pitchMessage}</p>
            </div>
          )}

          {/* Outreach Templates */}
          <div className="card-glass p-5 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Send size={16} className="text-violet-400" /> Ready-Made Outreach
            </h3>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['whatsapp', 'email', 'instagram', 'call'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                    activeTab === type
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {type === 'whatsapp' ? '📱' : type === 'email' ? '📧' : type === 'instagram' ? '📸' : '📞'} {type}
                </button>
              ))}
            </div>

            {activeTemplate && (
              <div className="space-y-3">
                {activeTemplate.subject && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Subject:</p>
                    <p className="text-sm text-slate-300 font-medium">{activeTemplate.subject}</p>
                  </div>
                )}
                <div className="relative">
                  <p className="text-xs text-slate-500 mb-1">Message:</p>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono border border-slate-800">
                    {activeTemplate.message}
                  </div>
                  <button
                    onClick={() => handleCopy(activeTemplate.message)}
                    className="absolute top-6 right-3 btn-ghost text-xs py-1 px-2"
                  >
                    {copied ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn-primary flex-1"
                    onClick={() => {
                      handleCopy(activeTemplate.message);
                      logOutreach(activeTab, activeTemplate.message);
                    }}
                  >
                    <Copy size={14} /> Copy & Log Outreach
                  </button>
                  {activeTab === 'whatsapp' && lead.phone && (
                    <ahref={`https://api.whatsapp.com/send?phone=91${lead.phone.replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(activeTemplate.message)}`}
                      
                      target="_blank" rel="noopener noreferrer"
                      onClick={() => logOutreach('whatsapp', activeTemplate.message)}
                      className="btn-secondary"
                    >
                      <Send size={14} /> Send via WA
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
