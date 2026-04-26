// src/app/leads/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Filter, Download, Search, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, Users,
} from 'lucide-react';
import { CITIES, CATEGORIES, NEED_TYPES, getLabelColor, getStatusColor, cn } from '@/lib/utils';
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

  // Filters
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [aiLabel, setAiLabel] = useState('');
  const [needType, setNeedType] = useState('');
  const [query, setQuery] = useState('');
  const [hasWebsite, setHasWebsite] = useState('');
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
      const res = await fetch(`/api/leads?${params}`);
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

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (aiLabel) params.set('aiLabel', aiLabel);
    if (status) params.set('status', status);

    const url = `/api/export?${params}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
    toast.success('CSV export started');
  };

  const handleReset = () => {
    setCity(''); setCategory(''); setStatus(''); setAiLabel('');
    setNeedType(''); setQuery(''); setHasWebsite(''); setPage(1);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Leads</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total.toLocaleString()} total leads in your pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
            <Filter size={15} /> Filters {showFilters ? '▲' : '▼'}
          </button>
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> Export CSV
          </button>
          <Link href="/search" className="btn-primary">
            + Find More Leads
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9"
          placeholder="Search by name, phone, address…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card-glass p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select className="select" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="select" value={aiLabel} onChange={(e) => { setAiLabel(e.target.value); setPage(1); }}>
            {LABEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="select" value={needType} onChange={(e) => { setNeedType(e.target.value); setPage(1); }}>
            <option value="">All Need Types</option>
            {NEED_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="select" value={hasWebsite} onChange={(e) => { setHasWebsite(e.target.value); setPage(1); }}>
            <option value="">Has Website?</option>
            <option value="false">No Website</option>
            <option value="true">Has Website</option>
          </select>

          <button onClick={handleReset} className="btn-ghost col-span-full md:col-span-1">
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      )}

      {/* Leads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-violet-400" />
        </div>
      ) : leads.length === 0 ? (
        <div className="card-glass p-16 text-center">
          <Users size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-slate-300 font-medium mb-2">No leads found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters or find new leads.</p>
          <Link href="/search" className="btn-primary mt-4 mx-auto">
            Find Leads
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                className="btn-secondary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-400">
                Page <span className="text-white font-medium">{page}</span> of {pages}
              </span>
              <button
                className="btn-secondary"
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
