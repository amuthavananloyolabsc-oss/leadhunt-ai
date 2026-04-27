'use client';

import { useState } from 'react';
import { Search, Zap, MapPin, Tag, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadCard } from '@/components/leads/lead-card';
import { toast } from 'sonner';
import type { Lead } from '@/types';

const CITIES = [
  'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Coimbatore',
  'Madurai', 'Surat', 'Indore', 'Nagpur', 'Kochi',
  'Vizag', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore',
];

const CATEGORIES = [
  'Restaurants', 'Clinics', 'Gyms', 'Schools', 'Shops',
  'Real Estate', 'Hotels', 'Salons', 'Hospitals', 'Lawyers',
  'Architects', 'CA Firms', 'Travel Agents', 'Auto Dealers',
  'Jewellery', 'Clothing', 'Electronics', 'Pharmacies',
  'Photography Studios', 'Event Planners', 'Interior Designers',
  'Contractors', 'Electricians', 'Plumbers', 'Caterers',
];

export default function SearchPage() {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searched, setSearched] = useState(false);
  const [totalFound, setTotalFound] = useState(0);

  const handleSearch = async () => {
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
        body: JSON.stringify({ city, category, forceRefresh: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      const allLeads: Lead[] = data.leads || [];
      setTotalFound(allLeads.length);
      const noWebsite = allLeads.filter(l => !l.hasWebsite);
      setLeads(noWebsite);
      setSearched(true);
      if (noWebsite.length === 0) {
        toast.info('No businesses without websites found. Try different category.');
      } else {
        toast.success(noWebsite.length + ' businesses WITHOUT website found in ' + city);
      }
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
          Finds businesses with NO website — your hottest leads ready to pitch.
        </p>
      </div>

      <div className="card-glass p-4 md:p-6 space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin size={11} /> City
            </label>
            <select
              className="select text-sm"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="">-- Select City --</option>
              <option value="Chennai">Chennai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Madurai">Madurai</option>
              <option value="Surat">Surat</option>
              <option value="Indore">Indore</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Kochi">Kochi</option>
              <option value="Vizag">Vizag</option>
              <option value="Trichy">Trichy</option>
              <option value="Salem">Salem</option>
              <option value="Tirunelveli">Tirunelveli</option>
              <option value="Vellore">Vellore</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Tag size={11} /> Category
            </label>
            <select
              className="select text-sm"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">-- Select Category --</option>
              <option value="Restaurants">Restaurants</option>
              <option value="Clinics">Clinics</option>
              <option value="Gyms">Gyms</option>
              <option value="Schools">Schools</option>
              <option value="Shops">Shops</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Hotels">Hotels</option>
              <option value="Salons">Salons</option>
              <option value="Hospitals">Hospitals</option>
              <option value="Lawyers">Lawyers</option>
              <option value="Architects">Architects</option>
              <option value="CA Firms">CA Firms</option>
              <option value="Travel Agents">Travel Agents</option>
              <option value="Auto Dealers">Auto Dealers</option>
              <option value="Jewellery">Jewellery</option>
              <option value="Clothing">Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Pharmacies">Pharmacies</option>
              <option value="Photography Studios">Photography Studios</option>
              <option value="Event Planners">Event Planners</option>
              <option value="Interior Designers">Interior Designers</option>
              <option value="Contractors">Contractors</option>
              <option value="Electricians">Electricians</option>
              <option value="Plumbers">Plumbers</option>
              <option value="Caterers">Caterers</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-transparent">Action</label>
            <button
              className="btn-primary w-full justify-center"
              onClick={handleSearch}
              disabled={loading || !city || !category}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Searching...</>
                : <><Search size={15} /> Search No-Website Leads</>
              }
            </button>
          </div>

        </div>

        <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/20 rounded-lg p-3 text-xs text-slate-400">
          <Zap size={13} className="text-red-400 mt-0.5 shrink-0" />
          <p>
            Shows ONLY businesses with <strong className="text-red-400">NO website</strong>.
            Every search fetches fresh results from Google Maps.
            Search different city and category combinations for unlimited leads daily!
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <p className="text-xs text-slate-500 w-full">Quick select category:</p>
          {['Restaurants', 'Clinics', 'Gyms', 'Salons', 'Hotels', 'Schools', 'Real Estate', 'Shops', 'Pharmacies', 'Lawyers'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg border transition-all',
                category === cat
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {loading && (
        <div className="card-glass p-12 text-center">
          <Loader2 size={36} className="animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Finding businesses without websites in {city}...</p>
          <p className="text-xs text-slate-600 mt-2">Analyzing each business — takes 20-40 seconds</p>
        </div>
      )}

      {searched && !loading && leads.length === 0 && (
        <div className="card-glass p-8 text-center">
          <p className="text-slate-300 font-medium mb-2">No businesses without websites found</p>
          <p className="text-slate-500 text-sm mb-1">
            Found {totalFound} businesses total but all have websites.
          </p>
          <p className="text-slate-500 text-sm mb-4">
            Try a different category or city.
          </p>
          <button onClick={handleSearch} className="btn-primary mx-auto">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {leads.length > 0 && !loading && (
        <div className="space-y-4">

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white font-bold text-xl">{leads.length}</span>
              <span className="text-slate-400 text-sm">businesses WITHOUT website in {city}</span>
              <span className="badge bg-red-500/20 text-red-400 border-red-500/30">
                🔥 All Hot Leads
              </span>
            </div>
            <button onClick={handleSearch} className="btn-secondary text-xs">
              <RefreshCw size={12} /> Get Fresh Leads
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
          </div>

          <div className="card-glass p-4 bg-violet-900/10 border-violet-500/20 text-center space-y-3">
            <p className="text-sm text-slate-300 font-medium">
              Want more leads? Try another category in {city}:
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {['Restaurants', 'Clinics', 'Gyms', 'Salons', 'Schools', 'Hotels', 'Real Estate', 'Shops'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-all',
                    category === cat
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Each category gives 10-30 new no-website leads. Search all categories for 200+ leads per city!
            </p>
          </div>

        </div>
      )}

    </div>
  );
}