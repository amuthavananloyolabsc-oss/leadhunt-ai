// src/app/settings/page.tsx
'use client';

import { useState } from 'react';
import { Settings, Key, Bell, Database, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CITIES, CATEGORIES } from '@/lib/utils';

export default function SettingsPage() {
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [alertCity, setAlertCity] = useState('Chennai');
  const [alertCategory, setAlertCategory] = useState('Restaurants');
  const [alertEnabled, setAlertEnabled] = useState(false);

  const handleSaveKey = () => {
    toast.success('API key saved (add to .env.local as GOOGLE_MAPS_API_KEY)');
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure LeadHunt AI for your workflow.</p>
      </div>

      {/* API Keys */}
      <div className="card-glass p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Key size={16} className="text-violet-400" /> API Configuration
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400">Google Maps API Key</label>
          <input
            type="password"
            className="input"
            placeholder="AIzaSy…"
            value={googleMapsKey}
            onChange={(e) => setGoogleMapsKey(e.target.value)}
          />
          <p className="text-[11px] text-slate-500">
            Used for real business data. Without it, mock data is used.{' '}
            <a href="https://developers.google.com/maps/documentation/places/web-service/get-api-key"
              target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              Get API key →
            </a>
          </p>
        </div>

        <button onClick={handleSaveKey} className="btn-primary">Save Key</button>
      </div>

      {/* Status */}
      <div className="card-glass p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Database size={16} className="text-violet-400" /> System Status
        </h3>

        {[
          { label: 'Mock Data Mode', status: !googleMapsKey, info: 'Using simulated business data' },
          { label: 'Website Analyzer', status: true, info: 'Active — analyzing websites on search' },
          { label: 'AI Scoring Engine', status: true, info: 'Scoring leads 0–100 automatically' },
          { label: 'CSV Export', status: true, info: 'Export up to 1,000 leads' },
          { label: 'CRM Statuses', status: true, info: 'Track new → contacted → closed' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            {item.status
              ? <CheckCircle size={15} className="text-emerald-400 shrink-0" />
              : <AlertCircle size={15} className="text-amber-400 shrink-0" />
            }
            <div className="flex-1">
              <p className="text-sm text-slate-300">{item.label}</p>
              <p className="text-xs text-slate-500">{item.info}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="card-glass p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bell size={16} className="text-violet-400" /> Daily Lead Alerts
        </h3>
        <p className="text-xs text-slate-400">
          (Coming soon) Get notified daily with fresh leads for your target city and category.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">City</label>
            <select className="select" value={alertCity} onChange={(e) => setAlertCity(e.target.value)}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Category</label>
            <select className="select" value={alertCategory} onChange={(e) => setAlertCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          className="btn-secondary opacity-50 cursor-not-allowed"
          disabled
          title="Coming soon"
        >
          <Bell size={14} /> Enable Daily Alerts (Coming Soon)
        </button>
      </div>

      {/* Setup Guide */}
      <div className="card-glass p-6 space-y-3 border-slate-700/40">
        <h3 className="font-semibold text-white">🚀 Quick Setup</h3>
        <ol className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2"><span className="text-violet-400 font-bold">1.</span> Set up PostgreSQL (Supabase / Neon — free tier)</li>
          <li className="flex gap-2"><span className="text-violet-400 font-bold">2.</span> Add <code className="text-emerald-400 bg-slate-800 px-1 rounded">DATABASE_URL</code> to <code className="bg-slate-800 px-1 rounded text-slate-300">.env.local</code></li>
          <li className="flex gap-2"><span className="text-violet-400 font-bold">3.</span> Run <code className="text-emerald-400 bg-slate-800 px-1 rounded">npx prisma db push</code></li>
          <li className="flex gap-2"><span className="text-violet-400 font-bold">4.</span> (Optional) Add Google Maps API key for real data</li>
          <li className="flex gap-2"><span className="text-violet-400 font-bold">5.</span> Run <code className="text-emerald-400 bg-slate-800 px-1 rounded">npm run dev</code> and start finding leads!</li>
        </ol>
      </div>
    </div>
  );
}
