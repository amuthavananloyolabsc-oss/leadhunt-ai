'use client';

import { useState } from 'react';
import { Search, Zap, MapPin, Tag, Loader2, RefreshCw } from 'lucide-react';
import { CITIES, CATEGORIES, cn } from '@/lib/utils';
import { LeadCard } from '@/components/leads/lead-card';
import { toast } from 'sonner';
import type { Lead } from '@/types';

const SOURCES = [
  { value: 'google_maps', label: '🗺 Google Maps' },
  { value: 'justdial', label: '📞 Justdial' },
  { value: 'sulekha', label: '🔍 Sulekha' },
  { value: 'indiamart', label: '🏭 IndiaMART' },
];

export default function SearchPage() {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searched, setSearched] = useState(false);
  const [activeSource, setActiveSource] = useState('google_maps');

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
        body: JSON.stringify({ city, category, forceRefresh, source: activeSource }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      // Only show leads WITHOUT website
      const noWebsiteLeads = (data.leads || []).filter((l: Lead) => !l.hasWebsite);
      setLeads(noWebsiteLeads);
      setSearched(true);
      toast.success('Found ' + noWebsiteLeads.length + ' businesses WITHOUT a website in ' + city + '!');
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Find Leads</h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          Find businesses with NO website — your hottest leads ready to pitch.
        </p>
      </div>

      <div className="card-glass p-4 md:p-6 space-y-4">

        {/* Source selector */}
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block">Lead Source</label>
          <div className="flex gap-2 flex-wrap">
            {SOURCES.map(s => (
              <button
                key={s.value}
                onClick={() => setActiveSource(s.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  activeSource === s.value
                    ? 'bg-violet-600 text-white border-violet-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {activeSource !== 'google_maps' && (
            <p className="text-xs text-amber-400 mt-2">
              ⚠ {activeSource === 'justdial' ? 'Justdial' : activeSource === 'sulekha' ? 'Sulekha' : 'IndiaMART'} uses simulated data — real scraping requires a paid proxy service.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin size={11} /> City
            </label>
            <select className="select text-sm" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">Select city...</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Tag size={11} /> Category
            </label>
            <select className="select text-sm" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category...</option>
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
                <button className="btn-secondary" onClick={() => handleSearch(true)} disabled={loading} title="Get fresh leads">
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/20 rounded-lg p-3 text-xs text-slate-400">
          <Zap size={13} className="text-red-400 mt-0.5 shrink-0" />
          <p>
            Showing <strong className="text-red-400">ONLY businesses with NO website</strong> — these are your hottest leads.
            Each search finds 20-40 new businesses. Hit refresh to get new ones daily!
          </p>
        </div>
      </div>

      {loading && (
        <div className="card-glass p-12 text-center">
          <Loader2 size={36} className="animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Searching for businesses without websites...</p>
          <p className="text-xs text-slate-600 mt-2">Analyzing each business — this takes 30-60 seconds</p>
        </div>
      )}

      {searched && !loading && leads.length === 0 && (
        <div className="card-glass p-12 text-center">
          <p className="text-slate-300 font-medium mb-2">No leads without websites found</p>
          <p className="text-slate-500 text-sm">All businesses in this search have websites. Try a different category or city, or hit refresh.</p>
          <button onClick={() => handleSearch(true)} className="btn-primary mt-4 mx-auto">
            <RefreshCw size={14} /> Try Fresh Search
          </button>
        </div>
      )}

      {leads.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1">
              <span className="text-white font-bold text-lg">{leads.length}</span>
              <span className="text-slate-400 text-sm ml-2">businesses found WITHOUT a website in {city}</span>
            </div>
            <button onClick={() => handleSearch(true)} className="btn-secondary text-xs">
              <RefreshCw size={12} /> Get Fresh Leads
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </div>

          <div className="card-glass p-4 bg-violet-900/10 border-violet-500/20 text-center">
            <p className="text-sm text-slate-300 mb-3">
              Want more leads? Search a different category or city!
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {['Restaurants', 'Clinics', 'Gyms', 'Salons', 'Schools'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); }}
                  className="badge bg-violet-500/20 text-violet-400 border-violet-500/30 cursor-pointer hover:bg-violet-500/30 text-xs py-1 px-3"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}