'use client';

import { useState } from 'react';
import { Search, Zap, MapPin, Tag, Loader2, RefreshCw, Globe } from 'lucide-react';
import { CITIES, CATEGORIES, cn, getLabelColor } from '@/lib/utils';
import { LeadCard } from '@/components/leads/lead-card';
import { toast } from 'sonner';
import type { Lead } from '@/types';

export default function SearchPage() {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(true);
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
      const allLeads: Lead[] = data.leads || [];
      const filtered = onlyNoWebsite ? allLeads.filter(l => !l.hasWebsite) : allLeads;
      setLeads(filtered);
      setFromCache(data.fromCache);
      setSearched(true);
      toast.success('Found ' + filtered.length + ' leads' + (onlyNoWebsite ? ' without website' : '') + ' in ' + city);
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const hotLeads = leads.filter(l => l.aiLabel === 'hot');
  const warmLeads = leads.filter(l => l.aiLabel === 'warm');
  const coldLeads = leads.filter(l => l.aiLabel === 'cold');

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Find Leads</h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">Search businesses — we score and filter who needs your services most.</p>
      </div>

      <div className="card-glass p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin size={11} /> City
            </label>
            <select className="select text-sm" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Tag size={11} /> Category
            </label>
            <select className="select text-sm" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-transparent">Action</label>
            <div className="flex gap-2">
              <button
                className="btn-primary flex-1 justify-center"
                onClick={() => handleSearch(false)}
                disabled={loading || !city || !category}
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Searching...</>
                  : <><Search size={15} /> Search Leads</>
                }
              </button>
              {searched && (
                <button className="btn-secondary" onClick={() => handleSearch(true)} disabled={loading}>
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setOnlyNoWebsite(!onlyNoWebsite)}
            className={cn(
              'w-10 h-5 rounded-full transition-all relative shrink-0',
              onlyNoWebsite ? 'bg-violet-600' : 'bg-slate-700'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
              onlyNoWebsite ? 'left-5' : 'left-0.5'
            )} />
          </button>
          <div>
            <p className="text-xs font-medium text-slate-200">Show only businesses WITHOUT a website</p>
            <p className="text-xs text-slate-500">These are your hottest leads — easiest to pitch and close</p>
          </div>
          <Globe size={16} className={onlyNoWebsite ? 'text-violet-400' : 'text-slate-600'} />
        </div>

        <div className="flex items-start gap-2 bg-violet-900/20 border border-violet-500/20 rounded-lg p-3 text-xs text-slate-400">
          <Zap size={13} className="text-violet-400 mt-0.5 shrink-0" />
          <p>
            Searching <strong className="text-slate-300">{category || 'businesses'}</strong> in <strong className="text-slate-300">{city || 'all cities'}</strong>.
            We fetch up to 60 businesses per search, analyze websites, and score each lead with AI.
          </p>
        </div>
      </div>

      {loading && (
        <div className="card-glass p-12 text-center">
          <Loader2 size={36} className="animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Searching and analyzing businesses...</p>
          <p className="text-xs text-slate-600 mt-2">This may take 30-60 seconds</p>
        </div>
      )}

      {searched && !loading && leads.length === 0 && (
        <div className="card-glass p-12 text-center">
          <p className="text-slate-300 font-medium mb-2">No leads found</p>
          <p className="text-slate-500 text-sm">Try turning off the no-website filter or search a different city/category.</p>
        </div>
      )}

      {leads.length > 0 && !loading && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-400">
              <span className="text-white font-semibold">{leads.length}</span> leads found
              {onlyNoWebsite && <span className="text-red-400 ml-1">(no website)</span>}
            </span>
            <span className="badge bg-red-500/20 text-red-400 border-red-500/30">🔥 {hotLeads.length} Hot</span>
            <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">🌡 {warmLeads.length} Warm</span>
            <span className="badge bg-blue-500/20 text-blue-400 border-blue-500/30">❄ {coldLeads.length} Cold</span>
            {fromCache && (
              <button onClick={() => handleSearch(true)} className="text-xs text-violet-400 ml-auto">
                Refresh data
              </button>
            )}
          </div>

          {hotLeads.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">🔥 Hot Leads — Act Now</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}

          {warmLeads.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">🌡 Warm Leads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {warmLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}

          {coldLeads.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">❄ Cold Leads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coldLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}