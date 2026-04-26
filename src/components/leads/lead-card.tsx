// src/components/leads/lead-card.tsx
'use client';

import Link from 'next/link';
import {
  Globe, Phone, Mail, Star, MapPin, Tag,
  AlertTriangle, CheckCircle, ArrowRight, MessageSquare,
} from 'lucide-react';
import { cn, getLabelColor, getStatusColor, truncate } from '@/lib/utils';
import type { Lead } from '@/types';

interface LeadCardProps {
  lead: Lead;
  compact?: boolean;
}

export function LeadCard({ lead, compact = false }: LeadCardProps) {
  const scoreColor =
    (lead.aiScore || 0) >= 60
      ? 'border-red-500 text-red-400 bg-red-500/10'
      : (lead.aiScore || 0) >= 30
      ? 'border-amber-500 text-amber-400 bg-amber-500/10'
      : 'border-blue-500 text-blue-400 bg-blue-500/10';

  return (
    <Link href={`/leads/${lead.id}`}
      className="card-glass p-5 hover:border-violet-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/20 group block">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('score-ring flex-shrink-0', scoreColor)}>
          {lead.aiScore || 0}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-violet-300 transition-colors">
              {lead.name}
            </h3>
            <span className={cn('badge shrink-0', getLabelColor(lead.aiLabel || 'cold'))}>
              {lead.aiLabel === 'hot' ? '🔥' : lead.aiLabel === 'warm' ? '🌡' : '❄'} {lead.aiLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin size={10} />{lead.city}</span>
            <span className="flex items-center gap-1"><Tag size={10} />{lead.category}</span>
          </div>
        </div>
      </div>

      {/* Website status */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3',
        !lead.hasWebsite
          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
          : lead.websiteScore && lead.websiteScore < 50
          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      )}>
        {!lead.hasWebsite ? (
          <><AlertTriangle size={12} /> No website — RED HOT lead</>
        ) : lead.websiteScore && lead.websiteScore < 50 ? (
          <><AlertTriangle size={12} /> Poor website (score: {lead.websiteScore}/100)</>
        ) : (
          <><CheckCircle size={12} /> Website score: {lead.websiteScore || 'N/A'}/100</>
        )}
      </div>

      {/* Contact info */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {lead.phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Phone size={11} className="text-slate-500" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
          {lead.website && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe size={11} className="text-slate-500" />
              <span className="truncate">{lead.website.replace(/https?:\/\//, '')}</span>
            </div>
          )}
          {lead.rating && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Star size={11} className="text-amber-500" />
              <span>{lead.rating} ({lead.reviewCount || 0} reviews)</span>
            </div>
          )}
        </div>
      )}

      {/* Pitch */}
      {lead.pitchMessage && !compact && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
          {lead.pitchMessage}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <span className={cn('badge text-[10px]', getStatusColor(lead.status))}>
          {lead.status.replace('_', ' ')}
        </span>
        <span className="text-xs text-violet-400 group-hover:text-violet-300 flex items-center gap-1 font-medium">
          View details <ArrowRight size={11} />
        </span>
      </div>
    </Link>
  );
}
