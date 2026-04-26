// src/app/search/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, Zap, MapPin, Tag, Loader2, RefreshCw } from 'lucide-react';
import { CITIES, CATEGORIES, NEED_TYPES, cn, getLabelColor } from '@/lib/utils';
import { LeadCard } from '@/components/leads/lead-card';
import { toast } from 'sonner';
import type { Lead } from '@/types';

export default function SearchPage() {
  const [city, setCity] = useState('Chennai');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fromCache, setFromCache] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (forceRefresh = false) => {
    if (!city || !category) {
      toast.error('Please select both city and category');
      return;
    }

    setLoading(true);
    setLeads([]);
    setSearched(false);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, category, forceRefresh }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Search failed');

      setLeads(data.leads || []);
      setFromCache(data.fromCache);
      setSearched(true);

      if (data.fromCache) {
        toast.info(`Loaded ${data.count} cached leads (< 24h old)`);
      } else {
        toast.success(`Found ${data.count} leads in ${city}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const hotLeads = leads.filter((l) => l.aiLabel === 'hot');
  const warmLeads = leads.filter((l) => l.aiLabel === 'warm');
  const coldLeads = leads.filter((l) => l.aiLabel === 'cold');

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Find Leads</h1>
        <p className="text-slate-400 text-sm mt-1">Search businesses by city & category. We'll score them and find who needs your services most.</p>
      </div>

      {/* Search Panel */}
      <div className="card-glass p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin size={12} /> City
            </label>
            <select
              className="select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Select city…</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Tag size={12} /> Category / Business Type
            </label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-transparent">Action</label>
            <div className="flex gap-2">
              <button
                className="btn-primary flex-1"
                onClick={() => handleSearch(false)}
                disabled={loading || !city || !category}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Searching…</>
                ) : (
                  <><Search size={16} /> Search Leads</>
                )}
              </button>
              {searched && fromCache && (
                <button
                  className="btn-secondary"
                  onClick={() => handleSearch(true)}
                  disabled={loading}
                  title="Force refresh — fetch fresh data"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-violet-900/20 border border-violet-500/20 rounded-lg p-3 text-xs text-slate-400">
          <Zap size={14} className="text-violet-400 mt-0.5 shrink-0" />
          <p>
            We search Google Maps for <strong className="text-slate-300">{category || 'businesses'}</strong> in <strong className="text-slate-300">{city}</strong>,
            analyze each website, and score leads using our AI model.
            Leads are cached for 24 hours to reduce API usage.
          </p>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="card-glass p-16 text-center">
          <Loader2 size={40} className="animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400">Searching & analyzing businesses…</p>
          <p className="text-xs text-slate-600 mt-2">This may take 30–60s while we analyze websites</p>
        </div>
      )}

      {searched && !loading && leads.length === 0 && (
        <div className="card-glass p-12 text-center">
          <Filter size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No leads found. Try a different city or category.</p>
        </div>
      )}

      {leads.length > 0 && !loading && (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-slate-400">
              <span className="text-white font-semibold">{leads.length}</span> leads found
            </span>
            <div className="flex items-center gap-2">
              <span className="badge bg-red-500/20 text-red-400 border-red-500/30">🔥 {hotLeads.length} Hot</span>
              <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">🌡 {warmLeads.length} Warm</span>
              <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30">❄ {coldLeads.length} Cold</span>
            </div>
            {fromCache && (
              <span className="text-xs text-slate-600 ml-auto">From cache — <button onClick={() => handleSearch(true)} className="text-violet-400 hover:text-violet-300">refresh</button></span>
            )}
          </div>

          {/* Hot leads first */}
          {hotLeads.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                🔥 Hot Leads — Act Now
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {hotLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}

          {warmLeads.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                🌡 Warm Leads
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {warmLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}

          {coldLeads.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                ❄ Cold Leads
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {coldLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
