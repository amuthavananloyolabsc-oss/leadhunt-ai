// src/app/outreach/page.tsx
'use client';

import { useState } from 'react';
import { MessageSquare, Send, Sparkles, Copy, CheckCheck, Wand2 } from 'lucide-react';
import { CATEGORIES, CITIES } from '@/lib/utils';
import { toast } from 'sonner';

const TEMPLATES = {
  noWebsite: {
    whatsapp: (name: string, city: string, cat: string) =>
      `Hi! 👋 I'm a web developer. I noticed *${name}* in ${city} doesn't have a website yet.\n\nI help ${cat.toLowerCase()} businesses get found on Google & attract more customers online 📱💻\n\n✅ Professional design\n✅ Mobile-friendly\n✅ Fast & SEO-ready\n✅ WhatsApp integration\n\nWould you like a free quote? Takes just 2 minutes! 🙏`,
    email: (name: string, city: string, cat: string) =>
      `Subject: Quick Website Quote for ${name} — Get More Customers Online!\n\nDear ${name} Team,\n\nI came across your ${cat.toLowerCase()} business in ${city} and noticed you don't have a website yet. In today's world, most people Google before visiting any business — meaning you might be losing customers daily.\n\nI specialize in building affordable websites for ${cat.toLowerCase()} businesses in ${city}. Here's what I offer:\n• Professional, mobile-friendly website\n• Google SEO so you rank locally\n• WhatsApp & contact form integration\n• Delivered in 7-14 days\n\nI'd love to offer you a FREE quote with no obligation.\n\nLooking forward to your reply!\n\n[Your Name]\n[Phone]\n[Portfolio]`,
  },
  poorWebsite: {
    whatsapp: (name: string, city: string, cat: string) =>
      `Hi! 👋 I visited *${name}'s* website and noticed a few issues that may be costing you customers — slow load, not mobile-friendly, missing contact form.\n\nI do website redesigns for ${cat.toLowerCase()} businesses in ${city} 🚀\n\nCan I share a quick proposal? It's free! 🙏`,
    email: (name: string, city: string, cat: string) =>
      `Subject: Your Website Could Be Losing You Customers — Free Audit Inside\n\nDear ${name} Team,\n\nI reviewed your website and found some issues that could be hurting your Google ranking and turning away customers:\n• Not optimized for mobile phones\n• Slow loading speed\n• Missing clear contact/WhatsApp button\n• Could use better SEO\n\nI offer a complete website redesign service for ${cat.toLowerCase()} businesses in ${city} — fast, modern, and affordable.\n\nWould you like a FREE website audit report? Just reply and I'll send it over!\n\n[Your Name]`,
  },
};

export default function OutreachPage() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Chennai');
  const [category, setCategory] = useState('Restaurants');
  const [scenario, setScenario] = useState<'noWebsite' | 'poorWebsite'>('noWebsite');
  const [type, setType] = useState<'whatsapp' | 'email'>('whatsapp');
  const [copied, setCopied] = useState(false);

  const getTemplate = () => {
    const tmpl = TEMPLATES[scenario][type];
    return tmpl(name || 'Business Name', city, category);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Template copied!');
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Outreach Templates</h1>
        <p className="text-slate-400 text-sm mt-1">Generate personalized pitch messages for your leads.</p>
      </div>

      {/* Generator */}
      <div className="card-glass p-6 space-y-5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Wand2 size={16} className="text-violet-400" /> Template Generator
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Business Name</label>
            <input
              className="input"
              placeholder="e.g. Raj Hotel"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">City</label>
            <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Category</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Scenario</label>
            <select className="select" value={scenario} onChange={(e) => setScenario(e.target.value as any)}>
              <option value="noWebsite">No Website</option>
              <option value="poorWebsite">Poor Website</option>
            </select>
          </div>
        </div>

        {/* Type selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setType('whatsapp')}
            className={`btn ${type === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
          >
            📱 WhatsApp
          </button>
          <button
            onClick={() => setType('email')}
            className={`btn ${type === 'email' ? 'btn-primary' : 'btn-secondary'}`}
          >
            📧 Email
          </button>
        </div>
      </div>

      {/* Generated Template */}
      <div className="card-glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" /> Generated Message
          </h3>
          <button onClick={handleCopy} className="btn-secondary text-xs">
            {copied ? <><CheckCheck size={13} className="text-emerald-400" /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono border border-slate-800 min-h-48">
          {getTemplate()}
        </div>

        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-primary">
            <Copy size={14} /> Copy Message
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="card-glass p-5 space-y-3 border-violet-500/20 bg-violet-900/10">
        <h3 className="font-semibold text-violet-300 text-sm">💡 Outreach Tips</h3>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li>• Best time to message: 10am–12pm and 3pm–6pm local time</li>
          <li>• Follow up once after 3 days if no reply (one follow-up max)</li>
          <li>• Personalize the message with something specific about their business</li>
          <li>• Lead with the problem, not your service</li>
          <li>• Attach a portfolio link or case study PDF when emailing</li>
          <li>• Use voice notes on WhatsApp — higher reply rates than text</li>
        </ul>
      </div>
    </div>
  );
}
