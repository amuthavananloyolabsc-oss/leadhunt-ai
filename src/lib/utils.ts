// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getScoreColor(score: number) {
  if (score >= 70) return 'text-red-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-emerald-500';
}

export function getLabelColor(label: string) {
  switch (label) {
    case 'hot': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'warm': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'cold': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    case 'contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'replied': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'closed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'follow_up': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export const CITIES = [
  'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Coimbatore',
  'Madurai', 'Surat', 'Indore', 'Nagpur', 'Kochi',
];

export const CATEGORIES = [
  'Restaurants', 'Clinics', 'Gyms', 'Schools', 'Shops',
  'Real Estate', 'Hotels', 'Salons', 'Hospitals', 'Lawyers',
  'Architects', 'CA Firms', 'Travel Agents', 'Auto Dealers',
  'Jewellery', 'Clothing', 'Electronics', 'Pharmacies',
  'Photography Studios', 'Event Planners', 'Interior Designers',
  'Contractors', 'Electricians', 'Plumbers', 'Caterers',
];

export const NEED_TYPES = [
  { value: 'no_website', label: 'No Website' },
  { value: 'redesign', label: 'Redesign Needed' },
  { value: 'seo', label: 'Need SEO' },
  { value: 'app', label: 'Need App' },
  { value: 'automation', label: 'Need Automation' },
  { value: 'hiring', label: 'Hiring Developer' },
];
