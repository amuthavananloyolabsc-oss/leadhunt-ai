// src/types/index.ts

export interface Lead {
  id: string;
  source: string;
  name: string;
  city: string;
  category: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  hasWebsite: boolean;
  websiteScore?: number | null;
  aiScore?: number | null;
  aiLabel?: string | null;
  status: LeadStatus;
  notes?: string | null;
  placeId?: string | null;
  lat?: number | null;
  lng?: number | null;
  hasWhatsApp?: boolean | null;
  hasSocials?: boolean | null;
  needType?: string | null;
  pitchMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'replied' | 'closed' | 'follow_up';
export type AiLabel = 'hot' | 'warm' | 'cold';

export interface SearchFilters {
  city?: string;
  category?: string;
  needType?: string;
  status?: string;
  minScore?: number;
  hasPhone?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  minRating?: number;
  query?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalLeads: number;
  newToday: number;
  noWebsite: number;
  highPriority: number;
  exportCount: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}

export interface GoogleMapsResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  lat?: number;
  lng?: number;
}

export interface WebsiteAnalysis {
  hasWebsite: boolean;
  score: number;
  issues: string[];
  ssl?: boolean;
  mobile?: boolean;
  speed?: 'fast' | 'medium' | 'slow';
  hasContact?: boolean;
  hasSEO?: boolean;
}

export interface OutreachTemplate {
  type: 'whatsapp' | 'email' | 'instagram' | 'call';
  subject?: string;
  message: string;
}
