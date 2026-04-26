// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Users, TrendingUp, Globe, Flame, Thermometer, Snowflake,
  Plus, ArrowRight, BarChart3, Clock, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn, getLabelColor, formatDate } from '@/lib/utils';

interface DashboardData {
  totalLeads: number;
  newToday: number;
  noWebsite: number;
  highPriority: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  recentLeads: any[];
  cityBreakdown: Array<{ city: string; _count: { id: number } }>;
  categoryBreakdown: Array<{ category: string; _count: { id: number } }>;
  statusBreakdown: Array<{ status: string; _count: { id: number } }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const noData = !data || data.totalLeads === 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back — here's what's happening today.</p>
        </div>
        <Link href="/search" className="btn-primary">
          <Plus size={16} />
          Find Leads
        </Link>
      </div>

      {noData && (
        <div className="card-glass p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-violet-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No leads yet</h2>
          <p className="text-slate-400 mb-5">Start by searching for businesses in your target city and category.</p>
          <Link href="/search" className="btn-primary mx-auto">
            <Plus size={16} /> Find Your First Leads
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      {data && (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={<Users size={20} className="text-violet-400" />}
              label="Total Leads"
              value={data.totalLeads}
              color="violet"
            />
            <StatCard
              icon={<Clock size={20} className="text-blue-400" />}
              label="New Today"
              value={data.newToday}
              color="blue"
            />
            <StatCard
              icon={<Globe size={20} className="text-red-400" />}
              label="No Website"
              value={data.noWebsite}
              color="red"
              sub="Hot leads"
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-amber-400" />}
              label="High Priority"
              value={data.highPriority}
              color="amber"
              sub="Score ≥60"
            />
          </div>

          {/* Priority breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <PriorityCard
              icon={<Flame size={18} />}
              label="Hot Leads"
              value={data.hotLeads}
              colorClass="text-red-400 bg-red-500/10 border-red-500/20"
            />
            <PriorityCard
              icon={<Thermometer size={18} />}
              label="Warm Leads"
              value={data.warmLeads}
              colorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            />
            <PriorityCard
              icon={<Snowflake size={18} />}
              label="Cold Leads"
              value={data.coldLeads}
              colorClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
            />
          </div>

          {/* Recent + Breakdown */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Leads */}
            <div className="xl:col-span-2 card-glass p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" /> Recent Leads
                </h3>
                <Link href="/leads" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {data.recentLeads.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No leads yet — start searching!</p>
                ) : (
                  data.recentLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border', getLabelColor(lead.aiLabel))}>
                        {(lead.aiScore || 0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.city} · {lead.category}</p>
                      </div>
                      <span className={cn('badge', getLabelColor(lead.aiLabel))}>
                        {lead.aiLabel}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Top Cities */}
            <div className="card-glass p-5 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-slate-400" /> Top Cities
              </h3>
              {data.cityBreakdown.length === 0 ? (
                <p className="text-slate-500 text-sm">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {data.cityBreakdown.map((item) => (
                    <div key={item.city} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{item.city}</span>
                        <span className="text-slate-500">{item._count.id}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (item._count.id / (data.totalLeads || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: number; color: string; sub?: string }) {
  const colors: Record<string, string> = {
    violet: 'from-violet-900/30 to-violet-900/10 border-violet-500/20',
    blue: 'from-blue-900/30 to-blue-900/10 border-blue-500/20',
    red: 'from-red-900/30 to-red-900/10 border-red-500/20',
    amber: 'from-amber-900/30 to-amber-900/10 border-amber-500/20',
  };

  return (
    <div className={cn('card-glass p-5 bg-gradient-to-br', colors[color])}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-800/60 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white tabular-nums">{value.toLocaleString()}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function PriorityCard({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: number; colorClass: string }) {
  return (
    <div className={cn('card-glass p-4 flex items-center gap-4 border', colorClass)}>
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClass)}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-white tabular-nums">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-8 bg-slate-800 rounded-lg w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800 rounded-xl" />)}
      </div>
      <div className="h-64 bg-slate-800 rounded-xl" />
    </div>
  );
}
