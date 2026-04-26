'use client';

import { useEffect, useState, useCallback } from 'react';
import { Filter, Download, Search, RefreshCw, Loader2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { CITIES, CATEGORIES, NEED_TYPES } from '@/lib/utils';
import { LeadCard } from '@/components/leads/lead-card';
import { toast } from 'sonner';
import type { Lead } from '@/types';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
  { value: 'follow_up', label: 'Follow Up' },
];

const LABEL_OPTIONS = [
  { value: '', label: 'All Priority' },
  { value: 'hot', label: '🔥 Hot' },
  { value: 'warm', label: '🌡 Warm' },
  { value: 'cold', label: '❄ Cold' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [aiLabel, setAiLabel] = useState('');
  const [needType, setNeedType] = useState('');
  const [query, setQuery] = useState('');
  const [hasWebsite, setHasWebsite] = useState('false');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (aiLabel) params.set('aiLabel', aiLabel);
    if (needType) params.set('needType', needType);
    if (query) params.set('query', query);
    if (hasWebsite !== '') params.set('hasWebsite', hasWebsite);
    try {
      const res = await fetch('/api/leads?' + params);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [city, category, status, aiLabel, needType, query, hasWebsite, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (aiLabel) params.set('aiLabel', aiLabel);
    if (status) params.set('status', status);
    if (hasWebsite !== '') params.set('hasWebsite', hasWebsite);
    const a = document.createElement('a');
    a.href = '/api/export?' + params;
    a.download = 'leads-' + Date.now() + '.csv';
    a.click();
    toast.success('CSV export started');
  };

  const handleReset = () => {
    setCity(''); setCategory(''); setStatus(''); setAiLabel('');
    setNeedType(''); setQuery(''); setHasWebsite('false'); setPage(1);
  };

  return (
    <div className="p-4 md:p-8 space-y-4">

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">My Leads</h1>
          <p className="text-slate-400 text-xs mt-1">{total.toLocaleString()} leads found</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-xs">
            <Filter size={13} /> Filters
          </button>
          <button onClick={handleExport} className="btn-secondary text-xs">
            <Download size={13} /> Export CSV
          </button>
          <Link href="/search" className="btn-primary text-xs">+ Find Leads</Link>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9 text-sm"
          placeholder="Search by name, phone, address..."
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
        />
      </div>

      {showFilters && (
        <div className="card-glass p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          <select className="select text-xs" value={city} onChange={e => { setCity(e.target.value); setPage(1); }}>
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select text-xs" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select text-xs" value={aiLabel} onChange={e => { setAiLabel(e.target.value); setPage(1); }}>
            {LABEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="select text-xs" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="select text-xs" value={needType} onChange={e => { setNeedType(e.target.value); setPage(1); }}>
            <option value="">All Need Types</option>
            {NEED_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="select text-xs" value={hasWebsite} onChange={e => { setHasWebsite(e.target.value); setPage(1); }}>
            <option value="">All Businesses</option>
            <option value="false">No Website Only</option>
            <option value="true">Has Website</option>
          </select>
          <button onClick={handleReset} className="btn-ghost text-xs col-span-2 md:col-span-1">
            <RefreshCw size={12} /> Reset
          </button>
        </div>
      )}

      {/* Active filter badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasWebsite === 'false' && (
          <span className="badge bg-red-500/20 text-red-400 border-red-500/30 text-xs">
            🔴 Showing: No Website Only
          </span>
        )}
        {hasWebsite === 'true' && (
          <span className="badge bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
            ✅ Showing: Has Website
          </span>
        )}
        {city && <span className="badge bg-slate-700 text-slate-300 border-slate-600 text-xs">📍 {city}</span>}
        {category && <span className="badge bg-slate-700 text-slate-300 border-slate-600 text-xs">🏷 {category}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-violet-400" />
        </div>
      ) : leads.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <Users size={36} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-medium mb-2">No leads found</h3>
          <p className="text-slate-500 text-sm mb-4">
            {hasWebsite === 'false' ? 'No businesses without websites found. Try a different city or search for more leads.' : 'Try adjusting your filters.'}
          </p>
          <Link href="/search" className="btn-primary mx-auto">Find Leads</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-400">Page <span className="text-white font-medium">{page}</span> of {pages}</span>
              <button className="btn-secondary" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}