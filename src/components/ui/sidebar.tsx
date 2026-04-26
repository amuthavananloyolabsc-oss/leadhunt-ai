// src/components/ui/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Users, MessageSquare,
  Download, Settings, Zap, Bell, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/search', icon: Search, label: 'Find Leads' },
  { href: '/leads', icon: Users, label: 'My Leads' },
  { href: '/outreach', icon: MessageSquare, label: 'Outreach' },
];

const SECONDARY = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d14] border-r border-slate-800/60 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/50 glow">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg leading-none">LeadHunt</span>
            <span className="block text-[10px] text-violet-400 font-medium tracking-wider uppercase leading-none mt-0.5">AI</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Main</p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              )}
            >
              <Icon size={17} className={active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-violet-500" />}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Account</p>
          {SECONDARY.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all group"
            >
              <Icon size={17} className="text-slate-500 group-hover:text-slate-300" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom promo card */}
      <div className="p-3 border-t border-slate-800/60">
        <div className="bg-gradient-to-br from-violet-900/40 to-pink-900/20 border border-violet-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">Daily Alerts</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Get fresh leads every morning for your city & category.
          </p>
          <Link href="/settings" className="mt-2 text-[11px] text-violet-400 hover:text-violet-300 font-medium block">
            Configure alerts →
          </Link>
        </div>
      </div>
    </aside>
  );
}
